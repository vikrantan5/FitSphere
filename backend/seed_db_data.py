import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models import *
from auth import hash_password
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_database():
    """Seed database with sample data"""
    
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    print("Clearing existing data...")
    collections = ['admins', 'users', 'trainers', 'programs', 'products', 'videos', 'images', 'bookings', 'orders', 'notifications', 'testimonials']
    for collection in collections:
        await db[collection].delete_many({})
    
    # 1. Create Admin
    print("Creating admin account...")
    admin = Admin(
        email="admin@fitsphere.com",
        name="FitSphere Admin",
        password_hash=hash_password("Admin@123"),
        role=UserRole.ADMIN
    )
    admin_dict = admin.model_dump()
    admin_dict['created_at'] = admin_dict['created_at'].isoformat()
    admin_dict['last_login'] = admin_dict['last_login'].isoformat() if admin_dict.get('last_login') else None
    await db.admins.insert_one(admin_dict)
    print(f"✅ Admin created: {admin.email} / Admin@123")
    
    # 2. Create Sample Users
    print("Creating sample users...")
    users_data = [
        {"name": "Sarah Johnson", "email": "sarah@example.com", "phone": "+91 98765 43210"},
        {"name": "Emily Davis", "email": "emily@example.com", "phone": "+91 98765 43211"},
        {"name": "Jessica Williams", "email": "jessica@example.com", "phone": "+91 98765 43212"},
        {"name": "Lisa Martinez", "email": "lisa@example.com", "phone": "+91 98765 43213"},
        {"name": "Ashley Brown", "email": "ashley@example.com", "phone": "+91 98765 43214"},
    ]
    
    user_ids = []
    for user_data in users_data:
        user = User(
            **user_data,
            password_hash=hash_password("password123"),
            role=UserRole.USER
        )
        user_dict = user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        await db.users.insert_one(user_dict)
        user_ids.append(user.id)
        print(f"✅ User created: {user.email} / password123")
    
    # 3. Create Trainers
    print("Creating trainers...")
    trainers_data = [
        {
            "name": "Priya Sharma",
            "email": "priya@fitsphere.com",
            "phone": "+91 98765 11111",
            "specialization": "Yoga & Flexibility",
            "experience_years": 8,
            "bio": "Certified yoga instructor specializing in Hatha and Vinyasa yoga. Helping women find balance and strength through mindful movement.",
            "certifications": ["RYT-500", "Prenatal Yoga Certified", "Yin Yoga Specialist"]
        },
        {
            "name": "Anjali Reddy",
            "email": "anjali@fitsphere.com",
            "phone": "+91 98765 22222",
            "specialization": "Strength Training",
            "experience_years": 6,
            "bio": "Personal trainer focused on women's strength and conditioning. Building confidence through progressive overload and proper form.",
            "certifications": ["NASM-CPT", "Women's Fitness Specialist", "Nutrition Coach"]
        },
        {
            "name": "Meera Patel",
            "email": "meera@fitsphere.com",
            "phone": "+91 98765 33333",
            "specialization": "Cardio & HIIT",
            "experience_years": 5,
            "bio": "High-energy fitness coach specializing in cardio and HIIT workouts. Making fitness fun and challenging for all levels.",
            "certifications": ["ACE Certified", "HIIT Specialist", "Group Fitness Instructor"]
        }
    ]
    
    trainer_ids = []
    for trainer_data in trainers_data:
        trainer = Trainer(**trainer_data)
        trainer_dict = trainer.model_dump()
        trainer_dict['created_at'] = trainer_dict['created_at'].isoformat()
        trainer_dict['updated_at'] = trainer_dict['updated_at'].isoformat()
        await db.trainers.insert_one(trainer_dict)
        trainer_ids.append(trainer.id)
        print(f"✅ Trainer created: {trainer.name} - {trainer.specialization}")
    
    # 4. Create Programs
    print("Creating fitness programs...")
    programs_data = [
        {
            "title": "Beginner Yoga Journey",
            "description": "Start your yoga practice with gentle flows and foundational poses. Perfect for complete beginners.",
            "category": "Yoga",
            "duration_weeks": 4,
            "price": 2999.00,
            "difficulty": VideoDifficulty.BEGINNER,
            "trainer_id": trainer_ids[0],
            "sessions_per_week": 3
        },
        {
            "title": "Strength Building Essentials",
            "description": "Build functional strength with progressive resistance training. Learn proper form and technique.",
            "category": "Strength",
            "duration_weeks": 8,
            "price": 4999.00,
            "difficulty": VideoDifficulty.INTERMEDIATE,
            "trainer_id": trainer_ids[1],
            "sessions_per_week": 4
        },
        {
            "title": "Fat Burn HIIT Challenge",
            "description": "High-intensity interval training to boost metabolism and burn fat. Get results in less time.",
            "category": "Cardio",
            "duration_weeks": 6,
            "price": 3499.00,
            "difficulty": VideoDifficulty.INTERMEDIATE,
            "trainer_id": trainer_ids[2],
            "sessions_per_week": 4
        },
        {
            "title": "Advanced Power Yoga",
            "description": "Challenge yourself with dynamic flows and advanced asanas. Build strength and flexibility.",
            "category": "Yoga",
            "duration_weeks": 12,
            "price": 5999.00,
            "difficulty": VideoDifficulty.ADVANCED,
            "trainer_id": trainer_ids[0],
            "sessions_per_week": 3
        }
    ]
    
    program_ids = []
    for program_data in programs_data:
        program = Program(**program_data)
        program.enrolled_count = 15 + len(program_ids) * 5  # Add some variety
        program_dict = program.model_dump()
        program_dict['created_at'] = program_dict['created_at'].isoformat()
        program_dict['updated_at'] = program_dict['updated_at'].isoformat()
        await db.programs.insert_one(program_dict)
        program_ids.append(program.id)
        print(f"✅ Program created: {program.title}")
    
    # 5. Create Products
    print("Creating fitness products...")
    products_data = [
        {
            "name": "Yoga Mat - Premium",
            "description": "High-quality non-slip yoga mat with extra cushioning. Perfect for all types of yoga practice.",
            "price": 1499.00,
            "discount": 10.0,
            "stock": 50,
            "category": "Equipment",
            "sku": "YM-001",
            "image_urls": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"]
        },
        {
            "name": "Resistance Bands Set",
            "description": "5-piece resistance band set with varying resistance levels. Great for strength training anywhere.",
            "price": 899.00,
            "discount": 15.0,
            "stock": 75,
            "category": "Equipment",
            "sku": "RB-001",
            "image_urls": ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500"]
        },
        {
            "name": "Protein Powder - Vanilla",
            "description": "Whey protein isolate for women. 25g protein per serving. Supports muscle recovery.",
            "price": 2499.00,
            "discount": 5.0,
            "stock": 30,
            "category": "Supplements",
            "sku": "PP-001",
            "image_urls": ["https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500"]
        },
        {
            "name": "Fitness Tracker Watch",
            "description": "Track your workouts, heart rate, and calories burned. Water-resistant smart fitness tracker.",
            "price": 3999.00,
            "discount": 20.0,
            "stock": 25,
            "category": "Wearables",
            "sku": "FT-001",
            "image_urls": ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"]
        },
        {
            "name": "Yoga Block Set",
            "description": "Set of 2 cork yoga blocks. Provides support and stability for your practice.",
            "price": 699.00,
            "discount": 0.0,
            "stock": 60,
            "category": "Equipment",
            "sku": "YB-001",
            "image_urls": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"]
        },
        {
            "name": "Gym Bag - Women's",
            "description": "Spacious gym bag with separate shoe compartment. Perfect for all your fitness essentials.",
            "price": 1799.00,
            "discount": 10.0,
            "stock": 40,
            "category": "Accessories",
            "sku": "GB-001",
            "image_urls": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"]
        }
    ]
    
    product_ids = []
    for product_data in products_data:
        product = Product(**product_data)
        product_dict = product.model_dump()
        product_dict['created_at'] = product_dict['created_at'].isoformat()
        product_dict['updated_at'] = product_dict['updated_at'].isoformat()
        await db.products.insert_one(product_dict)
        product_ids.append(product.id)
        print(f"✅ Product created: {product.name} - ₹{product.price}")
    
    # 6. Create Sample Videos
    print("Creating workout videos...")
    videos_data = [
        {
            "title": "Morning Yoga Flow - 20 Minutes",
            "category": VideoCategory.YOGA,
            "difficulty": VideoDifficulty.BEGINNER,
            "duration": 1200,
            "description": "Start your day with this energizing morning yoga flow. Perfect for beginners.",
            "video_url": "https://example.com/videos/morning-yoga.mp4",
            "view_count": 245
        },
        {
            "title": "Full Body Strength Workout",
            "category": VideoCategory.STRENGTH,
            "difficulty": VideoDifficulty.INTERMEDIATE,
            "duration": 1800,
            "description": "Build strength with this comprehensive full-body workout. No equipment needed.",
            "video_url": "https://example.com/videos/strength-workout.mp4",
            "view_count": 189
        },
        {
            "title": "30-Min HIIT Cardio Blast",
            "category": VideoCategory.CARDIO,
            "difficulty": VideoDifficulty.INTERMEDIATE,
            "duration": 1800,
            "description": "High-intensity cardio workout to burn calories and boost metabolism.",
            "video_url": "https://example.com/videos/hiit-cardio.mp4",
            "view_count": 312
        },
        {
            "title": "Pilates Core Strengthening",
            "category": VideoCategory.PILATES,
            "difficulty": VideoDifficulty.BEGINNER,
            "duration": 1500,
            "description": "Strengthen your core with these effective pilates exercises.",
            "video_url": "https://example.com/videos/pilates-core.mp4",
            "view_count": 156
        },
        {
            "title": "Evening Meditation & Stretching",
            "category": VideoCategory.MEDITATION,
            "difficulty": VideoDifficulty.BEGINNER,
            "duration": 900,
            "description": "Wind down with gentle stretching and meditation for better sleep.",
            "video_url": "https://example.com/videos/evening-meditation.mp4",
            "view_count": 278
        }
    ]
    
    for video_data in videos_data:
        video = Video(**video_data)
        video_dict = video.model_dump()
        video_dict['created_at'] = video_dict['created_at'].isoformat()
        video_dict['updated_at'] = video_dict['updated_at'].isoformat()
        await db.videos.insert_one(video_dict)
        print(f"✅ Video created: {video.title}")
    
    # 7. Create Sample Bookings
    print("Creating sample bookings...")
    for i, user_id in enumerate(user_ids[:3]):  # First 3 users
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        program = await db.programs.find_one({"id": program_ids[i % len(program_ids)]}, {"_id": 0})
        trainer = await db.trainers.find_one({"id": program['trainer_id']}, {"_id": 0})
        
        booking_date = (datetime.utcnow() + timedelta(days=i+1)).strftime("%Y-%m-%d")
        
        booking = Booking(
            user_id=user_id,
            user_name=user['name'],
            user_email=user['email'],
            user_phone=user.get('phone'),
            program_id=program['id'],
            program_title=program['title'],
            trainer_id=trainer['id'],
            trainer_name=trainer['name'],
            booking_date=booking_date,
            time_slot="09:00-10:00" if i % 2 == 0 else "16:00-17:00",
            status=BookingStatus.CONFIRMED if i % 2 == 0 else BookingStatus.PENDING,
            payment_status=PaymentStatus.SUCCESS if i % 2 == 0 else PaymentStatus.PENDING,
            amount=program['price']
        )
        
        booking_dict = booking.model_dump()
        booking_dict['created_at'] = booking_dict['created_at'].isoformat()
        booking_dict['updated_at'] = booking_dict['updated_at'].isoformat()
        await db.bookings.insert_one(booking_dict)
        print(f"✅ Booking created: {user['name']} - {program['title']}")
    
    # 8. Create Sample Orders
    print("Creating sample orders...")
    for i, user_id in enumerate(user_ids[:2]):  # First 2 users
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        product = await db.products.find_one({"id": product_ids[i % len(product_ids)]}, {"_id": 0})
        
        order = Order(
            user_id=user_id,
            items=[
                OrderItem(
                    product_id=product['id'],
                    product_name=product['name'],
                    quantity=1,
                    price=product['price']
                )
            ],
            total_amount=product['price'],
            customer_name=user['name'],
            customer_email=user['email'],
            customer_phone=user.get('phone', 'N/A'),
            shipping_address="123 Main Street, Mumbai, India 400001",
            order_status=OrderStatus.PROCESSING if i == 0 else OrderStatus.DELIVERED,
            payment_status=PaymentStatus.SUCCESS
        )
        
        order_dict = order.model_dump()
        order_dict['created_at'] = order_dict['created_at'].isoformat()
        order_dict['updated_at'] = order_dict['updated_at'].isoformat()
        await db.orders.insert_one(order_dict)
        print(f"✅ Order created: {user['name']} - {product['name']}")
    
    # 9. Create Notifications
    print("Creating notifications...")
    notifications_data = [
        {
            "notification_type": NotificationType.NEW_ORDER,
            "message": f"New order received from {users_data[0]['name']} - ₹{products_data[0]['price']}"
        },
        {
            "notification_type": NotificationType.NEW_USER,
            "message": f"New user registered: {users_data[4]['name']}"
        },
        {
            "notification_type": NotificationType.LOW_STOCK,
            "message": f"Low stock alert: {products_data[3]['name']} has only {products_data[3]['stock']} items left"
        }
    ]
    
    for notif_data in notifications_data:
        notification = Notification(**notif_data)
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
        print(f"✅ Notification created")
    
    # 10. Create Testimonials
    print("Creating testimonials...")
    testimonials_data = [
        {
            "user_id": user_ids[0],
            "user_name": users_data[0]['name'],
            "user_email": users_data[0]['email'],
            "rating": 5,
            "comment": "FitSphere has completely transformed my fitness journey! The trainers are amazing and the programs are so well-structured.",
            "service_type": "program",
            "is_approved": True
        },
        {
            "user_id": user_ids[1],
            "user_name": users_data[1]['name'],
            "user_email": users_data[1]['email'],
            "rating": 5,
            "comment": "Best fitness platform for women! Love the personalized attention and the supportive community.",
            "service_type": "session",
            "is_approved": True
        },
        {
            "user_id": user_ids[2],
            "user_name": users_data[2]['name'],
            "user_email": users_data[2]['email'],
            "rating": 4,
            "comment": "Great variety of workouts and excellent customer service. The products are high quality too!",
            "service_type": "product",
            "is_approved": True
        }
    ]
    
    for testimonial_data in testimonials_data:
        testimonial = Testimonial(**testimonial_data)
        testimonial_dict = testimonial.model_dump()
        testimonial_dict['created_at'] = testimonial_dict['created_at'].isoformat()
        await db.testimonials.insert_one(testimonial_dict)
        print(f"✅ Testimonial created from {testimonial.user_name}")
    
    print("\n✨ Database seeding completed successfully!")
    print("\n📋 Summary:")
    print(f"   • Admin: admin@fitsphere.com / Admin@123")
    print(f"   • Users: {len(users_data)} (all password: password123)")
    print(f"   • Trainers: {len(trainers_data)}")
    print(f"   • Programs: {len(programs_data)}")
    print(f"   • Products: {len(products_data)}")
    print(f"   • Videos: {len(videos_data)}")
    print(f"   • Bookings: 3")
    print(f"   • Orders: 2")
    print(f"   • Notifications: {len(notifications_data)}")
    print(f"   • Testimonials: {len(testimonials_data)}")

if __name__ == "__main__":
    asyncio.run(seed_database())
