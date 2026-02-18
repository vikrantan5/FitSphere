from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class VideoCategory(str, Enum):
    YOGA = "yoga"
    CARDIO = "cardio"
    STRENGTH = "strength"
    PILATES = "pilates"
    DANCE = "dance"
    MEDITATION = "meditation"

class VideoDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class NotificationType(str, Enum):
    NEW_ORDER = "new_order"
    FAILED_PAYMENT = "failed_payment"
    LOW_STOCK = "low_stock"
    NEW_USER = "new_user"
    SYSTEM_ERROR = "system_error"

class ImageType(str, Enum):
    BANNER = "banner"
    TRAINER = "trainer"
    GALLERY = "gallery"
    PROGRAM = "program"

# Request/Response Models
class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_id: str
    email: str
    name: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.ADMIN

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
    role: str

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    role: UserRole = UserRole.ADMIN
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    password_hash: str
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class VideoCreate(BaseModel):
    title: str
    category: VideoCategory
    difficulty: VideoDifficulty
    duration: int  # in seconds
    description: str
    thumbnail_url: Optional[str] = None

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: VideoCategory
    difficulty: VideoDifficulty
    duration: int
    description: str
    video_url: str
    thumbnail_url: Optional[str] = None
    is_public: bool = True
    view_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[VideoCategory] = None
    difficulty: Optional[VideoDifficulty] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_public: Optional[bool] = None

class ImageCreate(BaseModel):
    title: str
    image_type: ImageType
    description: Optional[str] = None

class Image(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_type: ImageType
    image_url: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    discount: float = 0.0
    stock: int
    category: str
    sku: str
    image_urls: List[str] = []

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    discount: float = 0.0
    stock: int
    category: str
    sku: str
    image_urls: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    image_urls: Optional[List[str]] = None
    is_active: Optional[bool] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_amount: float
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    total_amount: float
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    order_status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    amount: float
    status: PaymentStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    notification_type: NotificationType
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = None

class FileUploadResponse(BaseModel):
    success: bool
    file_name: str
    file_url: str
    cdn_url: str
    message: str = "File uploaded successfully"

class AnalyticsSummary(BaseModel):
    total_users: int
    total_revenue: float
    total_orders: int
    orders_today: int
    popular_products: List[dict]
    most_watched_videos: List[dict]
    payment_success_rate: float
    monthly_revenue: List[dict]

# Chat Message Models
class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_name: str
    sender_role: UserRole
    receiver_id: Optional[str] = None  # None means broadcast to admin
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

class ChatMessageCreate(BaseModel):
    receiver_id: Optional[str] = None
    message: str

# Testimonial Models
class TestimonialCreate(BaseModel):
    rating: int  # 1-5
    comment: str
    service_type: str  # session, product, video

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    rating: int
    comment: str
    service_type: str
    is_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
