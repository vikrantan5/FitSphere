import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    print("Starting database seeding...")
    
    await db.users.delete_many({})
    await db.programs.delete_many({})
    await db.products.delete_many({})
    await db.testimonials.delete_many({})
    await db.bookings.delete_many({})
    
    admin_user = {
        "id": "admin-001",
        "email": "admin@fitsphere.com",
        "name": "Admin User",
        "role": "admin",
        "password": pwd_context.hash("admin123"),
        "created_at": "2026-01-15T10:00:00Z"
    }
    await db.users.insert_one(admin_user)
    print("✓ Admin user created (admin@fitsphere.com / admin123)")
    
    member_user = {
        "id": "member-001",
        "email": "member@fitsphere.com",
        "name": "Sarah Johnson",
        "role": "member",
        "password": pwd_context.hash("member123"),
        "created_at": "2026-01-10T10:00:00Z"
    }
    await db.users.insert_one(member_user)
    print("✓ Member user created (member@fitsphere.com / member123)")
    
    programs = [
        {
            "id": "prog-001",
            "name": "Personal Training Elite",
            "description": "One-on-one personalized training with expert coaches for maximum results",
            "duration": "12 weeks",
            "price": 15000,
            "category": "Elite",
            "image_url": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prog-002",
            "name": "Weight Loss Transformation",
            "description": "Comprehensive program combining cardio, strength, and nutrition for sustainable weight loss",
            "duration": "16 weeks",
            "price": 12000,
            "category": "Transformation",
            "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prog-003",
            "name": "Yoga Balance Program",
            "description": "Holistic yoga sessions for flexibility, strength, and mental wellness",
            "duration": "8 weeks",
            "price": 8000,
            "category": "Wellness",
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prog-004",
            "name": "Strength Builder Pro",
            "description": "Build lean muscle and increase strength with progressive resistance training",
            "duration": "12 weeks",
            "price": 10000,
            "category": "Strength",
            "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prog-005",
            "name": "HIIT Mastery",
            "description": "High-intensity interval training for maximum fat burn and endurance",
            "duration": "6 weeks",
            "price": 7000,
            "category": "Cardio",
            "image_url": "https://images.unsplash.com/photo-1599447332128-0b3219997975?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prog-006",
            "name": "Prenatal Fitness",
            "description": "Safe and effective workouts designed for expecting mothers",
            "duration": "Throughout pregnancy",
            "price": 9000,
            "category": "Prenatal",
            "image_url": "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        }
    ]
    await db.programs.insert_many(programs)
    print(f"✓ {len(programs)} programs created")
    
    products = [
        {
            "id": "prod-001",
            "name": "Premium Yoga Mat",
            "description": "Eco-friendly, non-slip yoga mat with extra cushioning for ultimate comfort",
            "price": 2499,
            "category": "Equipment",
            "stock": 50,
            "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prod-002",
            "name": "Resistance Bands Set",
            "description": "5-piece resistance band set with varying resistance levels for all fitness levels",
            "price": 1799,
            "category": "Equipment",
            "stock": 75,
            "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prod-003",
            "name": "Adjustable Dumbbells",
            "description": "Space-saving adjustable dumbbells ranging from 2.5kg to 12.5kg per dumbbell",
            "price": 4999,
            "category": "Equipment",
            "stock": 30,
            "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prod-004",
            "name": "Whey Protein Isolate",
            "description": "Premium whey protein isolate with 25g protein per serving, chocolate flavor",
            "price": 3499,
            "category": "Supplements",
            "stock": 100,
            "image_url": "https://images.unsplash.com/photo-1623874514711-0f321325f318?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prod-005",
            "name": "Fitness Tracker Watch",
            "description": "Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking",
            "price": 6999,
            "category": "Technology",
            "stock": 25,
            "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        },
        {
            "id": "prod-006",
            "name": "Sports Water Bottle",
            "description": "Insulated stainless steel water bottle keeping drinks cold for 24 hours",
            "price": 999,
            "category": "Accessories",
            "stock": 150,
            "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
            "created_at": "2026-01-01T10:00:00Z"
        }
    ]
    await db.products.insert_many(products)
    print(f"✓ {len(products)} products created")
    
    testimonials = [
        {
            "id": "test-001",
            "name": "Priya Sharma",
            "rating": 5,
            "comment": "FitSphere transformed my life! The personalized training and supportive community helped me lose 15kg in 4 months. Best decision ever!",
            "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
            "date": "2025-12-15T10:00:00Z"
        },
        {
            "id": "test-002",
            "name": "Anjali Patel",
            "rating": 5,
            "comment": "The yoga program is incredible! I feel stronger, more flexible, and mentally balanced. The instructors are amazing and truly care.",
            "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            "date": "2025-11-20T10:00:00Z"
        },
        {
            "id": "test-003",
            "name": "Meera Reddy",
            "rating": 5,
            "comment": "As a new mom, the prenatal fitness program was a blessing. Safe, effective workouts that kept me healthy throughout my pregnancy.",
            "image_url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
            "date": "2025-10-10T10:00:00Z"
        },
        {
            "id": "test-004",
            "name": "Divya Kumar",
            "rating": 5,
            "comment": "The HIIT sessions are intense but so rewarding! I've gained so much confidence and energy. Highly recommend FitSphere!",
            "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
            "date": "2026-01-05T10:00:00Z"
        }
    ]
    await db.testimonials.insert_many(testimonials)
    print(f"✓ {len(testimonials)} testimonials created")
    
    print("\n✅ Database seeded successfully!")
    print("\nTest Credentials:")
    print("Admin: admin@fitsphere.com / admin123")
    print("Member: member@fitsphere.com / member123")

if __name__ == "__main__":
    asyncio.run(seed_database())
