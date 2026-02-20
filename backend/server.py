from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query, status
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Optional, Annotated
from datetime import datetime
import os
import logging
import razorpay
import hashlib
import hmac
import io
import csv
import socketio

# Import local modules
from models import *
from auth import hash_password, verify_password, create_access_token, get_current_admin, get_current_user, get_current_user_or_admin
from bunny_cdn import (
    upload_video_to_bunny_stream,
    delete_bunny_stream_video,
    upload_to_bunny_storage
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.environ['RAZORPAY_KEY_ID'],
    os.environ['RAZORPAY_KEY_SECRET']
))

# Create the main app
app = FastAPI(title="FitSphere API")

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Wrap FastAPI app with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== AUTHENTICATION ENDPOINTS ====================

@api_router.post("/auth/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest):
    """Admin login endpoint"""
    admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
    
    if not admin or not verify_password(credentials.password, admin['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not admin.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    await db.admins.update_one(
        {"id": admin['id']},
        {"$set": {"last_login": datetime.utcnow().isoformat()}}
    )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": admin['id'],
            "email": admin['email'],
            "role": admin['role']
        }
    )
    
    return AdminLoginResponse(
        access_token=access_token,
        admin_id=admin['id'],
        email=admin['email'],
        name=admin['name']
    )

@api_router.post("/auth/create-admin")
async def create_admin(admin_data: AdminCreate):
    """Create a new admin (protected endpoint - for setup only)"""
    # Check if admin already exists
    existing = await db.admins.find_one({"email": admin_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")
    
    admin = Admin(
        email=admin_data.email,
        name=admin_data.name,
        password_hash=hash_password(admin_data.password),
        role=admin_data.role
    )
    
    admin_dict = admin.model_dump()
    admin_dict['created_at'] = admin_dict['created_at'].isoformat()
    if admin_dict.get('last_login'):
        admin_dict['last_login'] = admin_dict['last_login'].isoformat()
    
    await db.admins.insert_one(admin_dict)
    
    return {"message": "Admin created successfully", "admin_id": admin.id}

@api_router.get("/auth/me")
async def get_current_admin_info(admin: dict = Depends(get_current_admin)):
    """Get current admin information"""
    admin_data = await db.admins.find_one({"id": admin['admin_id']}, {"_id": 0, "password_hash": 0})
    if not admin_data:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin_data

# ==================== VIDEO MANAGEMENT ENDPOINTS ====================

@api_router.post("/videos/upload", response_model=FileUploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    difficulty: str = Form(...),
    duration: int = Form(...),
    description: str = Form(...),
    is_free: bool = Form(True),
    admin: dict = Depends(get_current_admin)
):
    """Upload video to Bunny Stream"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    try:
        # Upload to Bunny Stream (not storage)
        upload_result = await upload_video_to_bunny_stream(file, title)
        
        # Save video metadata to database
        video = Video(
            title=title,
            category=VideoCategory(category),
            difficulty=VideoDifficulty(difficulty),
            duration=duration,
            description=description,
            video_url=upload_result['playback_url'],  # Use playback URL for streaming
            embed_url=upload_result['embed_url'],     # Store embed URL separately
            video_id=upload_result['video_id'],       # Store Bunny video ID
            is_free=is_free
        )
        
        video_dict = video.model_dump()
        video_dict['created_at'] = video_dict['created_at'].isoformat()
        video_dict['updated_at'] = video_dict['updated_at'].isoformat()
        
        await db.videos.insert_one(video_dict)
        
        # Create notification
        notification = Notification(
            notification_type=NotificationType.SYSTEM_ERROR,
            message=f"New video uploaded: {title}"
        )
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
        
        return FileUploadResponse(
            success=True,
            file_name=file.filename,
            file_url=upload_result['playback_url'],
            cdn_url=upload_result['embed_url']
        )
    
    except Exception as e:
        logger.error(f"Video upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos", response_model=List[Video])
async def get_videos(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all videos with optional filters"""
    query = {}
    if category:
        query['category'] = category
    if difficulty:
        query['difficulty'] = difficulty
    if search:
        query['title'] = {"$regex": search, "$options": "i"}
    
    videos = await db.videos.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for video in videos:
        for field in ['created_at', 'updated_at']:
            if isinstance(video.get(field), str):
                video[field] = datetime.fromisoformat(video[field])
    
    return videos

@api_router.get("/videos/public", response_model=List[Video])
async def get_public_videos(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get only free/public videos (no authentication required)"""
    query = {"is_free": True}
    if category:
        query['category'] = category
    if difficulty:
        query['difficulty'] = difficulty
    if search:
        query['title'] = {"$regex": search, "$options": "i"}
    
    videos = await db.videos.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for video in videos:
        for field in ['created_at', 'updated_at']:
            if isinstance(video.get(field), str):
                video[field] = datetime.fromisoformat(video[field])
    
    return videos

@api_router.get("/videos/{video_id}", response_model=Video)
async def get_video(video_id: str):
    """Get single video by ID"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(video.get(field), str):
            video[field] = datetime.fromisoformat(video[field])
    
    return video

@api_router.put("/videos/{video_id}", response_model=Video)
async def update_video(
    video_id: str,
    video_update: VideoUpdate,
    admin: dict = Depends(get_current_admin)
):
    """Update video metadata"""
    update_data = {k: v for k, v in video_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.videos.update_one({"id": video_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    
    updated_video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    
    for field in ['created_at', 'updated_at']:
        if isinstance(updated_video.get(field), str):
            updated_video[field] = datetime.fromisoformat(updated_video[field])
    
    return updated_video

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, admin: dict = Depends(get_current_admin)):
    """Delete video from database and Bunny Stream"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete from Bunny Stream using the stored video_id
    bunny_video_id = video.get('video_id')
    if bunny_video_id:
        await delete_bunny_stream_video(bunny_video_id)
    
    await db.videos.delete_one({"id": video_id})
    
    return {"message": "Video deleted successfully"}

# ==================== IMAGE MANAGEMENT ENDPOINTS ====================

@api_router.post("/images/upload", response_model=FileUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    title: str = Form(...),
    image_type: str = Form(...),
    description: Optional[str] = Form(None),
    admin: dict = Depends(get_current_admin)
):
    """Upload image to Bunny Storage"""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    destination_path = f"images/{safe_filename}"
    
    try:
        upload_result = await upload_to_bunny_storage(file, destination_path)
        
        image = Image(
            title=title,
            image_type=ImageType(image_type),
            image_url=upload_result['cdn_url'],
            description=description
        )
        
        image_dict = image.model_dump()
        image_dict['created_at'] = image_dict['created_at'].isoformat()
        
        await db.images.insert_one(image_dict)
        
        return FileUploadResponse(
            success=True,
            file_name=file.filename,
            file_url=upload_result['cdn_url'],
            cdn_url=upload_result['cdn_url']
        )
    
    except Exception as e:
        logger.error(f"Image upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/images", response_model=List[Image])
async def get_images(
    image_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all images"""
    query = {}
    if image_type:
        query['image_type'] = image_type
    
    images = await db.images.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for image in images:
        if isinstance(image.get('created_at'), str):
            image['created_at'] = datetime.fromisoformat(image['created_at'])
    
    return images

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: str, admin: dict = Depends(get_current_admin)):
    """Delete image"""
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    cdn_url = image.get('image_url', '')
    if 'images/' in cdn_url:
        file_path = cdn_url.split('/')[-2] + '/' + cdn_url.split('/')[-1]
        await delete_from_bunny_cdn(file_path)
    
    await db.images.delete_one({"id": image_id})
    
    return {"message": "Image deleted successfully"}

# ==================== PRODUCT MANAGEMENT ENDPOINTS ====================

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, admin: dict = Depends(get_current_admin)):
    """Create new product"""
    new_product = Product(**product.model_dump())
    
    product_dict = new_product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    product_dict['updated_at'] = product_dict['updated_at'].isoformat()
    
    await db.products.insert_one(product_dict)
    
    # Check for low stock and create notification
    if new_product.stock < 10:
        notification = Notification(
            notification_type=NotificationType.LOW_STOCK,
            message=f"Low stock alert: {new_product.name} has only {new_product.stock} items left"
        )
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
    
    return new_product

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all products"""
    query = {}
    if category:
        query['category'] = category
    if search:
        query['name'] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for product in products:
        for field in ['created_at', 'updated_at']:
            if isinstance(product.get(field), str):
                product[field] = datetime.fromisoformat(product[field])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(product.get(field), str):
            product[field] = datetime.fromisoformat(product[field])
    
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    admin: dict = Depends(get_current_admin)
):
    """Update product"""
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    for field in ['created_at', 'updated_at']:
        if isinstance(updated_product.get(field), str):
            updated_product[field] = datetime.fromisoformat(updated_product[field])
    
    # Check for low stock
    if updated_product.get('stock', 0) < 10:
        notification = Notification(
            notification_type=NotificationType.LOW_STOCK,
            message=f"Low stock alert: {updated_product['name']} has only {updated_product['stock']} items left"
        )
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
    
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    """Delete product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ==================== ORDER MANAGEMENT ENDPOINTS ====================

@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(order_data: OrderCreate):
    """Create Razorpay order"""
    try:
        # Create order in Razorpay (amount in paise)
        razorpay_order = razorpay_client.order.create({
            "amount": int(order_data.total_amount * 100),  # Convert to paise
            "currency": "INR",
            "payment_capture": 1
        })
        
        # Save order to database
        order = Order(**order_data.model_dump())
        order.razorpay_order_id = razorpay_order['id']
        
        order_dict = order.model_dump()
        order_dict['created_at'] = order_dict['created_at'].isoformat()
        order_dict['updated_at'] = order_dict['updated_at'].isoformat()
        
        await db.orders.insert_one(order_dict)
        
        # Create notification
        notification = Notification(
            notification_type=NotificationType.NEW_ORDER,
            message=f"New order received: {order_data.customer_name} - ₹{order_data.total_amount}"
        )
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
        
        return {
            "order_id": order.id,
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "razorpay_key_id": os.environ['RAZORPAY_KEY_ID']
        }
    
    except Exception as e:
        logger.error(f"Order creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/orders/verify-payment")
async def verify_payment(
    razorpay_order_id: str = Form(...),
    razorpay_payment_id: str = Form(...),
    razorpay_signature: str = Form(...)
):
    """Verify Razorpay payment"""
    try:
        # Verify signature
        generated_signature = hmac.new(
            os.environ['RAZORPAY_KEY_SECRET'].encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update order status
        order = await db.orders.find_one({"razorpay_order_id": razorpay_order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        await db.orders.update_one(
            {"razorpay_order_id": razorpay_order_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.SUCCESS.value,
                    "payment_id": razorpay_payment_id,
                    "order_status": OrderStatus.PROCESSING.value,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        # Save payment record
        payment = Payment(
            order_id=order['id'],
            razorpay_payment_id=razorpay_payment_id,
            razorpay_order_id=razorpay_order_id,
            razorpay_signature=razorpay_signature,
            amount=order['total_amount'],
            status=PaymentStatus.SUCCESS
        )
        
        payment_dict = payment.model_dump()
        payment_dict['created_at'] = payment_dict['created_at'].isoformat()
        
        await db.payments.insert_one(payment_dict)
        
        # Update product stock
        for item in order['items']:
            await db.products.update_one(
                {"id": item['product_id']},
                {"$inc": {"stock": -item['quantity']}}
            )
        
        return {"success": True, "message": "Payment verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: dict = Depends(get_current_admin)
):
    """Get all orders"""
    query = {}
    if status:
        query['order_status'] = status
    if payment_status:
        query['payment_status'] = payment_status
    
    orders = await db.orders.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for order in orders:
        for field in ['created_at', 'updated_at']:
            if isinstance(order.get(field), str):
                order[field] = datetime.fromisoformat(order[field])
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, admin: dict = Depends(get_current_admin)):
    """Get single order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(order.get(field), str):
            order[field] = datetime.fromisoformat(order[field])
    
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    order_status: str,
    admin: dict = Depends(get_current_admin)
):
    """Update order status"""
    result = await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "order_status": order_status,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

@api_router.get("/orders/export/csv")
async def export_orders_csv(admin: dict = Depends(get_current_admin)):
    """Export orders to CSV"""
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        "Order ID", "Customer Name", "Email", "Phone",
        "Total Amount", "Order Status", "Payment Status",
        "Order Date"
    ])
    
    # Write data
    for order in orders:
        writer.writerow([
            order['id'],
            order['customer_name'],
            order['customer_email'],
            order['customer_phone'],
            order['total_amount'],
            order['order_status'],
            order['payment_status'],
            order['created_at']
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"}
    )

# ==================== USER MANAGEMENT ENDPOINTS ====================

@api_router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 50,
    admin: dict = Depends(get_current_admin)
):
    """Get all users"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, admin: dict = Depends(get_current_admin)):
    """Get single user with purchase history"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's orders
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {
        **user,
        "orders": orders
    }

# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get("/analytics/dashboard", response_model=AnalyticsSummary)
async def get_dashboard_analytics(admin: dict = Depends(get_current_admin)):
    """Get dashboard analytics"""
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total revenue and orders
    orders = await db.orders.find({"payment_status": PaymentStatus.SUCCESS.value}, {"_id": 0}).to_list(10000)
    total_revenue = sum(order['total_amount'] for order in orders)
    total_orders = len(orders)
    
    # Orders today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    orders_today = await db.orders.count_documents({
        "created_at": {"$gte": today_start},
        "payment_status": PaymentStatus.SUCCESS.value
    })
    
    # Popular products (top 5)
    all_orders = await db.orders.find({"payment_status": PaymentStatus.SUCCESS.value}, {"_id": 0}).to_list(10000)
    product_sales = {}
    for order in all_orders:
        for item in order.get('items', []):
            product_id = item['product_id']
            product_sales[product_id] = product_sales.get(product_id, 0) + item['quantity']
    
    popular_product_ids = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    popular_products = []
    for prod_id, quantity in popular_product_ids:
        product = await db.products.find_one({"id": prod_id}, {"_id": 0})
        if product:
            popular_products.append({
                "name": product['name'],
                "sales": quantity
            })
    
    # Most watched videos (top 5)
    most_watched = await db.videos.find(
        {},
        {"_id": 0, "title": 1, "view_count": 1}
    ).sort("view_count", -1).limit(5).to_list(5)
    
    # Payment success rate
    all_payments = await db.payments.find({}, {"_id": 0}).to_list(10000)
    total_payments = len(all_payments)
    successful_payments = sum(1 for p in all_payments if p['status'] == PaymentStatus.SUCCESS.value)
    payment_success_rate = (successful_payments / total_payments * 100) if total_payments > 0 else 0
    
    # Monthly revenue (last 6 months)
    monthly_revenue = []
    from datetime import timedelta
    for i in range(6):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        month_orders = await db.orders.find({
            "payment_status": PaymentStatus.SUCCESS.value,
            "created_at": {
                "$gte": month_start.isoformat(),
                "$lt": month_end.isoformat()
            }
        }, {"_id": 0}).to_list(10000)
        
        month_total = sum(order['total_amount'] for order in month_orders)
        monthly_revenue.insert(0, {
            "month": month_start.strftime("%b %Y"),
            "revenue": month_total
        })
    
    return AnalyticsSummary(
        total_users=total_users,
        total_revenue=total_revenue,
        total_orders=total_orders,
        orders_today=orders_today,
        popular_products=popular_products,
        most_watched_videos=most_watched,
        payment_success_rate=payment_success_rate,
        monthly_revenue=monthly_revenue
    )

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 20,
    admin: dict = Depends(get_current_admin)
):
    """Get notifications"""
    query = {}
    if unread_only:
        query['is_read'] = False
    
    notifications = await db.notifications.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    admin: dict = Depends(get_current_admin)
):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

# ==================== SOCKET.IO EVENT HANDLERS ====================

# Store active connections
active_connections = {}

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logger.info(f"Client connected: {sid}")
    return True

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    if sid in active_connections:
        del active_connections[sid]
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    """User joins their personal room"""
    user_id = data.get('user_id')
    if user_id:
        active_connections[sid] = user_id
        await sio.enter_room(sid, f"user_{user_id}")
        logger.info(f"User {user_id} joined room")

@sio.event
async def send_message(sid, data):
    """Handle chat message"""
    try:
        # Save message to database
        message = ChatMessage(
            sender_id=data['sender_id'],
            sender_name=data['sender_name'],
            sender_role=UserRole(data['sender_role']),
            receiver_id=data.get('receiver_id'),
            message=data['message']
        )
        
        message_dict = message.model_dump()
        message_dict['created_at'] = message_dict['created_at'].isoformat()
        
        await db.chat_messages.insert_one(message_dict)
        
        # Emit to receiver
        if data.get('receiver_id'):
            await sio.emit('new_message', message_dict, room=f"user_{data['receiver_id']}")
        else:
            # Broadcast to all admins
            await sio.emit('new_message', message_dict, room='admin_room')
        
        # Confirm to sender
        await sio.emit('message_sent', {'success': True, 'message_id': message.id}, room=sid)
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        await sio.emit('error', {'message': str(e)}, room=sid)

# ==================== CHAT ENDPOINTS ====================

@api_router.get("/chat/messages", response_model=List[ChatMessage])
async def get_chat_messages(
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get chat messages for current user"""
    query = {
        "$or": [
            {"sender_id": user['user_id']},
            {"receiver_id": user['user_id']}
        ]
    }
    
    messages = await db.chat_messages.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", 1).to_list(limit)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

@api_router.get("/chat/admin/messages", response_model=List[ChatMessage])
async def get_admin_chat_messages(
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    admin: dict = Depends(get_current_admin)
):
    """Get all chat messages for admin"""
    query = {}
    if user_id:
        query = {
            "$or": [
                {"sender_id": user_id},
                {"receiver_id": user_id}
            ]
        }
    
    messages = await db.chat_messages.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", 1).to_list(limit)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

@api_router.put("/chat/messages/{message_id}/read")
async def mark_message_read(message_id: str, user: dict = Depends(get_current_user)):
    """Mark message as read"""
    result = await db.chat_messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message marked as read"}

# ==================== TESTIMONIAL ENDPOINTS ====================

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    user: dict = Depends(get_current_user)
):
    """Create new testimonial"""
    # Get user details
    user_data = await db.users.find_one({"id": user['user_id']}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    testimonial = Testimonial(
        user_id=user['user_id'],
        user_name=user_data['name'],
        user_email=user_data['email'],
        rating=testimonial_data.rating,
        comment=testimonial_data.comment,
        service_type=testimonial_data.service_type
    )
    
    testimonial_dict = testimonial.model_dump()
    testimonial_dict['created_at'] = testimonial_dict['created_at'].isoformat()
    
    await db.testimonials.insert_one(testimonial_dict)
    
    # Notify admin
    await sio.emit('new_testimonial', testimonial_dict, room='admin_room')
    
    return testimonial

@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(
    approved_only: bool = True,
    service_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get testimonials"""
    query = {}
    if approved_only:
        query['is_approved'] = True
    if service_type:
        query['service_type'] = service_type
    
    testimonials = await db.testimonials.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for testimonial in testimonials:
        if isinstance(testimonial.get('created_at'), str):
            testimonial['created_at'] = datetime.fromisoformat(testimonial['created_at'])
    
    return testimonials

@api_router.put("/testimonials/{testimonial_id}/approve")
async def approve_testimonial(
    testimonial_id: str,
    admin: dict = Depends(get_current_admin)
):
    """Approve testimonial"""
    result = await db.testimonials.update_one(
        {"id": testimonial_id},
        {"$set": {"is_approved": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    return {"message": "Testimonial approved"}

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: str,
    admin: dict = Depends(get_current_admin)
):
    """Delete testimonial"""
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    return {"message": "Testimonial deleted successfully"}

# ==================== USER AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=UserLoginResponse)
async def user_register(user_data: UserRegisterRequest):
    """Register new user"""
    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        role=UserRole.USER
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    
    return UserLoginResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value
    )

@api_router.post("/auth/user/login", response_model=UserLoginResponse)
async def user_login(credentials: UserLoginRequest):
    """User login endpoint"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user['id'],
            "email": user['email'],
            "role": user['role']
        }
    )
    
    return UserLoginResponse(
        access_token=access_token,
        user_id=user['id'],
        email=user['email'],
        name=user['name'],
        role=user['role']
    )

@api_router.get("/auth/user/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current user information"""
    user_data = await db.users.find_one({"id": user['user_id']}, {"_id": 0, "password_hash": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data

# ==================== TRAINER MANAGEMENT ENDPOINTS ====================

@api_router.post("/trainers", response_model=Trainer)
async def create_trainer(trainer: TrainerCreate, admin: dict = Depends(get_current_admin)):
    """Create new trainer"""
    new_trainer = Trainer(**trainer.model_dump())
    
    trainer_dict = new_trainer.model_dump()
    trainer_dict['created_at'] = trainer_dict['created_at'].isoformat()
    trainer_dict['updated_at'] = trainer_dict['updated_at'].isoformat()
    
    await db.trainers.insert_one(trainer_dict)
    
    return new_trainer

@api_router.get("/trainers", response_model=List[Trainer])
async def get_trainers(
    specialization: Optional[str] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 50
):
    """Get all trainers"""
    query = {"is_active": is_active} if is_active else {}
    if specialization:
        query['specialization'] = specialization
    
    trainers = await db.trainers.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for trainer in trainers:
        for field in ['created_at', 'updated_at']:
            if isinstance(trainer.get(field), str):
                trainer[field] = datetime.fromisoformat(trainer[field])
    
    return trainers

@api_router.get("/trainers/{trainer_id}", response_model=Trainer)
async def get_trainer(trainer_id: str):
    """Get single trainer"""
    trainer = await db.trainers.find_one({"id": trainer_id}, {"_id": 0})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(trainer.get(field), str):
            trainer[field] = datetime.fromisoformat(trainer[field])
    
    return trainer

@api_router.put("/trainers/{trainer_id}", response_model=Trainer)
async def update_trainer(
    trainer_id: str,
    trainer_update: TrainerUpdate,
    admin: dict = Depends(get_current_admin)
):
    """Update trainer"""
    update_data = {k: v for k, v in trainer_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.trainers.update_one({"id": trainer_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    updated_trainer = await db.trainers.find_one({"id": trainer_id}, {"_id": 0})
    
    for field in ['created_at', 'updated_at']:
        if isinstance(updated_trainer.get(field), str):
            updated_trainer[field] = datetime.fromisoformat(updated_trainer[field])
    
    return updated_trainer

@api_router.delete("/trainers/{trainer_id}")
async def delete_trainer(trainer_id: str, admin: dict = Depends(get_current_admin)):
    """Delete trainer"""
    result = await db.trainers.delete_one({"id": trainer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    return {"message": "Trainer deleted successfully"}

# ==================== PROGRAM MANAGEMENT ENDPOINTS ====================

@api_router.post("/programs", response_model=Program)
async def create_program(program: ProgramCreate, admin: dict = Depends(get_current_admin)):
    """Create new program"""
    # Verify trainer exists
    trainer = await db.trainers.find_one({"id": program.trainer_id}, {"_id": 0})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    new_program = Program(**program.model_dump())
    
    program_dict = new_program.model_dump()
    program_dict['created_at'] = program_dict['created_at'].isoformat()
    program_dict['updated_at'] = program_dict['updated_at'].isoformat()
    
    await db.programs.insert_one(program_dict)
    
    return new_program

@api_router.get("/programs", response_model=List[Program])
async def get_programs(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    trainer_id: Optional[str] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 50
):
    """Get all programs"""
    query = {"is_active": is_active} if is_active else {}
    if category:
        query['category'] = category
    if difficulty:
        query['difficulty'] = difficulty
    if trainer_id:
        query['trainer_id'] = trainer_id
    
    programs = await db.programs.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for program in programs:
        for field in ['created_at', 'updated_at']:
            if isinstance(program.get(field), str):
                program[field] = datetime.fromisoformat(program[field])
    
    return programs

@api_router.get("/programs/{program_id}", response_model=Program)
async def get_program(program_id: str):
    """Get single program"""
    program = await db.programs.find_one({"id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(program.get(field), str):
            program[field] = datetime.fromisoformat(program[field])
    
    return program

@api_router.put("/programs/{program_id}", response_model=Program)
async def update_program(
    program_id: str,
    program_update: ProgramUpdate,
    admin: dict = Depends(get_current_admin)
):
    """Update program"""
    update_data = {k: v for k, v in program_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.programs.update_one({"id": program_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    
    updated_program = await db.programs.find_one({"id": program_id}, {"_id": 0})
    
    for field in ['created_at', 'updated_at']:
        if isinstance(updated_program.get(field), str):
            updated_program[field] = datetime.fromisoformat(updated_program[field])
    
    return updated_program

@api_router.delete("/programs/{program_id}")
async def delete_program(program_id: str, admin: dict = Depends(get_current_admin)):
    """Delete program"""
    result = await db.programs.delete_one({"id": program_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    
    return {"message": "Program deleted successfully"}

# ==================== BOOKING/SESSION ENDPOINTS ====================

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    """Create new booking with attendance type and location"""
    # Get user, program, and trainer details
    user_data = await db.users.find_one({"id": user['user_id']}, {"_id": 0})
    program = await db.programs.find_one({"id": booking_data.program_id}, {"_id": 0})
    trainer = await db.trainers.find_one({"id": booking_data.trainer_id}, {"_id": 0})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Validate attendance type
    if booking_data.attendance_type == "gym" and not program.get('supports_gym_attendance', True):
        raise HTTPException(status_code=400, detail="This program does not support gym attendance")
    
    if booking_data.attendance_type == "home_visit":
        if not program.get('supports_home_visit', False):
            raise HTTPException(status_code=400, detail="This program does not support home visits")
        if not booking_data.user_location:
            raise HTTPException(status_code=400, detail="User location is required for home visits")
        if not booking_data.user_location.get('address') or not booking_data.user_location.get('latitude'):
            raise HTTPException(status_code=400, detail="Complete location details (address and coordinates) are required")
    
    # Check if slot is available
    existing_booking = await db.bookings.find_one({
        "trainer_id": booking_data.trainer_id,
        "booking_date": booking_data.booking_date,
        "time_slot": booking_data.time_slot,
        "status": {"$in": [BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value]}
    }, {"_id": 0})
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Calculate amount based on attendance type
    base_amount = program['price']
    additional_charge = 0.0
    if booking_data.attendance_type == "home_visit":
        additional_charge = program.get('home_visit_additional_charge', 0.0)
    total_amount = base_amount + additional_charge
    
    # Get gym location if gym attendance
    gym_location = None
    if booking_data.attendance_type == "gym":
        gym_settings = await db.gym_settings.find_one({}, {"_id": 0})
        if gym_settings:
            gym_location = gym_settings.get('gym_location')
    
    booking = Booking(
        user_id=user['user_id'],
        user_name=user_data['name'],
        user_email=user_data['email'],
        user_phone=user_data.get('phone'),
        program_id=booking_data.program_id,
        program_title=program['title'],
        trainer_id=booking_data.trainer_id,
        trainer_name=trainer['name'],
        booking_date=booking_data.booking_date,
        time_slot=booking_data.time_slot,
        attendance_type=booking_data.attendance_type,
        user_location=booking_data.user_location,
        gym_location=gym_location,
        notes=booking_data.notes,
        amount=total_amount
    )
    
    booking_dict = booking.model_dump()
    booking_dict['created_at'] = booking_dict['created_at'].isoformat()
    booking_dict['updated_at'] = booking_dict['updated_at'].isoformat()
    
    await db.bookings.insert_one(booking_dict)
    
    # Create notification for admin
    attendance_text = "at gym" if booking_data.attendance_type == "gym" else "at home"
    notification = Notification(
        notification_type=NotificationType.NEW_ORDER,
        message=f"New booking: {user_data['name']} booked {program['title']} {attendance_text} on {booking_data.booking_date}"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(
    status: Optional[str] = None,
    trainer_id: Optional[str] = None,
    booking_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: dict = Depends(get_current_admin)
):
    """Get all bookings (admin only)"""
    query = {}
    if status:
        query['status'] = status
    if trainer_id:
        query['trainer_id'] = trainer_id
    if booking_date:
        query['booking_date'] = booking_date
    
    bookings = await db.bookings.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for booking in bookings:
        for field in ['created_at', 'updated_at']:
            if isinstance(booking.get(field), str):
                booking[field] = datetime.fromisoformat(booking[field])
    
    return bookings

@api_router.get("/bookings/user/my-bookings", response_model=List[Booking])
async def get_my_bookings(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get user's own bookings"""
    query = {"user_id": user['user_id']}
    if status:
        query['status'] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for booking in bookings:
        for field in ['created_at', 'updated_at']:
            if isinstance(booking.get(field), str):
                booking[field] = datetime.fromisoformat(booking[field])
    
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, user: dict = Depends(get_current_user_or_admin)):
    """Get single booking"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if user owns this booking or is admin
    if user['role'] == 'user' and booking['user_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(booking.get(field), str):
            booking[field] = datetime.fromisoformat(booking[field])
    
    return booking

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    booking_update: BookingUpdate,
    admin: dict = Depends(get_current_admin)
):
    """Update booking status (admin only)"""
    update_data = {k: v for k, v in booking_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.bookings.update_one({"id": booking_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking updated successfully"}

@api_router.get("/bookings/trainer/{trainer_id}/available-slots")
async def get_available_slots(
    trainer_id: str,
    booking_date: str
):
    """Get available time slots for a trainer on a specific date"""
    # Define all possible slots
    all_slots = [
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "14:00-15:00", "15:00-16:00", "16:00-17:00",
        "17:00-18:00", "18:00-19:00"
    ]
    
    # Get booked slots
    booked_bookings = await db.bookings.find({
        "trainer_id": trainer_id,
        "booking_date": booking_date,
        "status": {"$in": [BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value]}
    }, {"_id": 0, "time_slot": 1}).to_list(100)
    
    booked_slots = [booking['time_slot'] for booking in booked_bookings]
    
    available_slots = [slot for slot in all_slots if slot not in booked_slots]
    
    return {
        "date": booking_date,
        "trainer_id": trainer_id,
        "available_slots": available_slots,
        "booked_slots": booked_slots
    }

@api_router.post("/bookings/{booking_id}/create-payment")
async def create_booking_payment(booking_id: str, user: dict = Depends(get_current_user)):
    """Create Razorpay payment for booking"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking['user_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Create order in Razorpay
        razorpay_order = razorpay_client.order.create({
            "amount": int(booking['amount'] * 100),  # Convert to paise
            "currency": "INR",
            "payment_capture": 1
        })
        
        # Update booking with razorpay order ID
        await db.bookings.update_one(
            {"id": booking_id},
            {"$set": {"razorpay_order_id": razorpay_order['id']}}
        )
        
        return {
            "booking_id": booking_id,
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "razorpay_key_id": os.environ['RAZORPAY_KEY_ID']
        }
    
    except Exception as e:
        logger.error(f"Payment creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/bookings/{booking_id}/verify-payment")
async def verify_booking_payment(
    booking_id: str,
    razorpay_order_id: str = Form(...),
    razorpay_payment_id: str = Form(...),
    razorpay_signature: str = Form(...),
    user: dict = Depends(get_current_user)
):
    """Verify Razorpay payment for booking"""
    try:
        # Verify signature
        generated_signature = hmac.new(
            os.environ['RAZORPAY_KEY_SECRET'].encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update booking
        booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.SUCCESS.value,
                    "payment_id": razorpay_payment_id,
                    "status": BookingStatus.CONFIRMED.value,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        # Save payment record
        payment = Payment(
            order_id=booking_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_order_id=razorpay_order_id,
            razorpay_signature=razorpay_signature,
            amount=booking['amount'],
            status=PaymentStatus.SUCCESS
        )
        
        payment_dict = payment.model_dump()
        payment_dict['created_at'] = payment_dict['created_at'].isoformat()
        
        await db.payments.insert_one(payment_dict)
        
        # Update trainer session count
        await db.trainers.update_one(
            {"id": booking['trainer_id']},
            {"$inc": {"total_sessions": 1}}
        )
        
        # Update program enrollment count
        await db.programs.update_one(
            {"id": booking['program_id']},
            {"$inc": {"enrolled_count": 1}}
        )
        
        return {"success": True, "message": "Payment verified and booking confirmed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/bookings/export/csv")
async def export_bookings_csv(admin: dict = Depends(get_current_admin)):
    """Export bookings to CSV"""
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers

# ==================== GYM SETTINGS ENDPOINTS ====================

@api_router.get("/gym-settings")
async def get_gym_settings():
    """Get gym settings (public endpoint)"""
    settings = await db.gym_settings.find_one({}, {"_id": 0})
    if not settings:
        return None
    
    # Convert datetime fields if needed
    if settings.get('created_at') and isinstance(settings['created_at'], str):
        settings['created_at'] = datetime.fromisoformat(settings['created_at'])
    if settings.get('updated_at') and isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return settings

@api_router.post("/gym-settings")
async def save_gym_settings(settings_data: GymSettingsCreate, admin: dict = Depends(get_current_admin)):
    """Save or update gym settings (admin only)"""
    # Validate location
    if not settings_data.gym_location.address or settings_data.gym_location.latitude == 0:
        raise HTTPException(status_code=400, detail="Valid gym location is required")
    
    # Check if settings exist
    existing = await db.gym_settings.find_one({}, {"_id": 0})
    
    gym_location_dict = {
        "address": settings_data.gym_location.address,
        "latitude": settings_data.gym_location.latitude,
        "longitude": settings_data.gym_location.longitude
    }
    
    if existing:
        # Update existing settings
        update_data = {
            "gym_name": settings_data.gym_name,
            "gym_location": gym_location_dict,
            "contact_phone": settings_data.contact_phone,
            "contact_email": settings_data.contact_email,
            "operating_hours": settings_data.operating_hours,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await db.gym_settings.update_one(
            {"id": existing['id']},
            {"$set": update_data}
        )
        
        return {"message": "Gym settings updated successfully"}
    else:
        # Create new settings
        new_settings = GymSettings(
            gym_name=settings_data.gym_name,
            gym_location=gym_location_dict,
            contact_phone=settings_data.contact_phone,
            contact_email=settings_data.contact_email,
            operating_hours=settings_data.operating_hours
        )
        
        settings_dict = new_settings.model_dump()
        settings_dict['created_at'] = settings_dict['created_at'].isoformat()
        settings_dict['updated_at'] = settings_dict['updated_at'].isoformat()
        
        await db.gym_settings.insert_one(settings_dict)
        
        return {"message": "Gym settings created successfully"}

    writer.writerow([
        "Booking ID", "User Name", "Email", "Phone",
        "Program", "Trainer", "Date", "Time Slot",
        "Status", "Payment Status", "Amount", "Created At"
    ])
    
    # Write data
    for booking in bookings:
        writer.writerow([
            booking['id'],
            booking['user_name'],
            booking['user_email'],
            booking.get('user_phone', ''),
            booking['program_title'],
            booking['trainer_name'],
            booking['booking_date'],
            booking['time_slot'],
            booking['status'],
            booking['payment_status'],
            booking['amount'],
            booking['created_at']
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bookings.csv"}
    )

@api_router.get("/orders/user/my-orders", response_model=List[Order])
async def get_my_orders(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get user's own orders"""
    orders = await db.orders.find(
        {"user_id": user['user_id']},
        {"_id": 0}
    ).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    
    for order in orders:
        for field in ['created_at', 'updated_at']:
            if isinstance(order.get(field), str):
                order[field] = datetime.fromisoformat(order[field])
    
    return orders

# ==================== BASIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "FitSphere API - Women's Fitness Platform", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"])
def health():
    return {"status": "running"}

@app.on_event("startup")
async def startup_event():
    """Create default admin on startup if none exists"""
    admin_count = await db.admins.count_documents({})
    if admin_count == 0:
        logger.info("Creating default admin account...")
        default_admin = Admin(
            email="admin@fitsphere.com",
            name="Admin",
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN
        )
        admin_dict = default_admin.model_dump()
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        if admin_dict.get('last_login'):
            admin_dict['last_login'] = admin_dict['last_login'].isoformat()
        
        await db.admins.insert_one(admin_dict)
        logger.info(f"Default admin created: admin@fitsphere.com / Admin@123")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
