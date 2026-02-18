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
from auth import hash_password, verify_password, create_access_token, get_current_admin
from bunny_cdn import upload_to_bunny_cdn, delete_from_bunny_cdn

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
    admin: dict = Depends(get_current_admin)
):
    """Upload video to Bunny CDN"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Create destination path
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    destination_path = f"videos/{safe_filename}"
    
    try:
        # Upload to Bunny CDN
        upload_result = await upload_to_bunny_cdn(file, destination_path, "video")
        
        # Save video metadata to database
        video = Video(
            title=title,
            category=VideoCategory(category),
            difficulty=VideoDifficulty(difficulty),
            duration=duration,
            description=description,
            video_url=upload_result['cdn_url']
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
            file_url=upload_result['file_url'],
            cdn_url=upload_result['cdn_url']
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
    """Delete video from database and CDN"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Extract file path from CDN URL
    cdn_url = video.get('video_url', '')
    if 'videos/' in cdn_url:
        file_path = cdn_url.split('/')[-2] + '/' + cdn_url.split('/')[-1]
        await delete_from_bunny_cdn(file_path)
    
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
    """Upload image to Bunny CDN"""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    destination_path = f"images/{safe_filename}"
    
    try:
        upload_result = await upload_to_bunny_cdn(file, destination_path, "image")
        
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
            file_url=upload_result['file_url'],
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

@api_router.get("/users", response_model=List[User])
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
