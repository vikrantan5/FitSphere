import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Calendar, ShoppingBag, LogOut, 
  ChevronRight, Clock, Truck, PlayCircle, MessageSquareText, Star,
  Dumbbell, Bell, User, Settings, HelpCircle, Gift, Award,
  TrendingUp, Shield, Zap, Target, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { UserLayout } from '@/components/user/UserLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your order #ORD123 has been shipped', type: 'order', read: false },
    { id: 2, message: 'New workout video available: HIIT Cardio', type: 'video', read: false },
    { id: 3, message: 'Your session with Trainer Sarah is tomorrow', type: 'booking', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 24,
    caloriesBurned: 3240,
    streakDays: 7,
    achievements: 12
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'user') {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [userRes, ordersRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/auth/user/me`, config),
        axios.get(`${API}/orders/user/my-orders`, config),
        axios.get(`${API}/bookings/user/my-bookings`, config)
      ]);

      setUser(userRes.data);
      setOrders(ordersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      success: 'bg-green-500/20 text-green-300 border-green-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  };

  const getBookingStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <UserLayout activePath="/user/dashboard" hidePageHeader>
        <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-300"
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
      </UserLayout>
    );
  }

  if (!user) return null;

return (
    <UserLayout 
      activePath="/user/dashboard" 
      hidePageHeader
      actions={
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
            <Card className="saas-glass-card relative overflow-hidden border border-white/10 backdrop-blur-xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-1">
                      <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900"
                    />
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <Award className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      Welcome back, {user.name}! 👋
                    </h2>
                    <p className="text-zinc-300 mb-2">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 text-white cursor-pointer"
                    onClick={() => navigate('/user/orders')}
                  >
                    <ShoppingBag className="w-6 h-6 mb-2 opacity-80" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs opacity-90">Total Orders</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white cursor-pointer"
                    onClick={() => navigate('/user/bookings')}
                  >
                    <Calendar className="w-6 h-6 mb-2 opacity-80" />
                    <p className="text-2xl font-bold">{bookings.length}</p>
                    <p className="text-xs opacity-90">Bookings</p>
                  </motion.div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { label: 'Workouts', value: stats.totalWorkouts, icon: Activity, color: 'cyan' },
                  { label: 'Calories', value: stats.caloriesBurned, icon: Target, color: 'purple' },
                  { label: 'Streak', value: stats.streakDays, icon: Zap, color: 'amber' },
                  { label: 'Achievements', value: stats.achievements, icon: Award, color: 'emerald' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 rounded-xl p-3 border border-white/10"
                  >
                    <stat.icon className={`w-4 h-4 text-${stat.color}-400 mb-1`} />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {[
            {
              icon: ShoppingBag,
              title: 'Shop Products',
              description: 'Equipment & supplements',
              color: 'cyan',
              path: '/user/shop',
              testId: 'shop-card'
            },
            {
              icon: Calendar,
              title: 'Book Session',
              description: 'Personal training',
              color: 'blue',
              path: '/user/sessions',
              testId: 'sessions-card'
            },
            {
              icon: PlayCircle,
              title: 'Training Videos',
              description: 'On-demand workouts',
              color: 'purple',
              path: '/user/videos',
              testId: 'videos-card'
            },
            {
              icon: Package,
              title: 'Cart & Checkout',
              description: 'Review & purchase',
              color: 'emerald',
              path: '/user/cart',
              testId: 'cart-card'
            },
            {
              icon: MessageSquareText,
              title: 'Need Support',
              description: 'Chat with us',
              color: 'purple',
              path: '/user/chat',
              testId: 'support-card'
            }
          ].map((action, index) => (
            <motion.div
              key={action.testId}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Card 
                className="group cursor-pointer overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-white/10 hover:border-white/20 transition-all touch-manipulation"
               onClick={() => navigate(action.path)}
                data-testid={action.testId}
               style={{ position: 'relative', touchAction: 'pan-y' }}
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br from-${action.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                  style={{ pointerEvents: 'none' }}
                />
                <div className="relative p-6 pointer-events-none">
                  <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{action.description}</p>
                  <div className={`flex items-center text-${action.color}-400 group-hover:gap-2 transition-all`}>
                    <span className="text-sm">Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Orders and Bookings Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
         <Card className="saas-glass-card border border-white/10 backdrop-blur-xl">
            <Tabs defaultValue="orders" className="p-6">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-800/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="orders" 
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg transition-all"
                  data-testid="orders-tab"
                >
                  <Package className="w-4 h-4 mr-2" />
                  My Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg transition-all"
                  data-testid="bookings-tab"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                {orders.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/20"
                  >
                    <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-300 mb-4">No orders yet</p>
                    <Button 
                      onClick={() => navigate('/user/shop')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
                    >
                      Start Shopping
                    </Button>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border border-white/10 bg-zinc-800/50 hover:bg-zinc-800/70 transition-all" data-testid={`order-${order.id}`}>
                          <div className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white" data-testid={`order-id-${order.id}`}>
                                    Order #{order.id.substring(0, 8)}
                                  </h3>
                                  <Badge className={getOrderStatusColor(order.order_status)}>
                                    {order.order_status}
                                  </Badge>
                                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                                    {order.payment_status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-zinc-400" data-testid={`order-date-${order.id}`}>
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                  ₹{order.total_amount}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3" data-testid={`order-items-${order.id}`}>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-white" data-testid={`order-item-name-${order.id}-${idx}`}>
                                        {item.product_name}
                                      </p>
                                      <p className="text-sm text-zinc-400">Quantity: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <p className="font-semibold text-cyan-400" data-testid={`order-item-price-${order.id}-${idx}`}>
                                    ₹{item.price * item.quantity}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl">
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Customer Information</p>
                                <p className="text-sm text-white" data-testid={`order-customer-name-${order.id}`}>
                                  {order.customer_name}
                                </p>
                                <p className="text-sm text-zinc-400" data-testid={`order-customer-email-${order.id}`}>
                                  {order.customer_email}
                                </p>
                                <p className="text-sm text-zinc-400" data-testid={`order-customer-phone-${order.id}`}>
                                  {order.customer_phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Shipping Address</p>
                                <p className="text-sm text-zinc-400" data-testid={`order-shipping-address-${order.id}`}>
                                  {order.shipping_address}
                                </p>
                              </div>
                            </div>

                               {order.payment_status === 'success' && order.estimated_delivery_date && order.estimated_delivery_time && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl"
                                data-testid={`order-delivery-estimate-${order.id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Truck className="w-5 h-5 text-emerald-400" />
                                  <div>
                                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                                      Estimated Delivery
                                    </p>
                                    <p className="text-sm text-emerald-300">
                                      {new Date(order.estimated_delivery_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })} at {order.estimated_delivery_time}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                               {/* ISSUE 4 FIX: Show payment failed UI with retry/cancel options */}
                            {order.payment_status === 'failed' && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl"
                                data-testid={`order-payment-failed-${order.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">
                                      Payment Failed
                                    </p>
                                    <p className="text-sm text-red-300">
                                      Your payment could not be processed
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                      Retry Payment
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10"
                                    >
                                      Cancel Order
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                {bookings.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/20"
                  >
                    <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-300 mb-4">No bookings yet</p>
                    <Button 
                      onClick={() => navigate('/user/sessions')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
                    >
                      Book a Session
                    </Button>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border border-white/10 bg-zinc-800/50 hover:bg-zinc-800/70 transition-all" data-testid={`booking-${booking.id}`}>
                          <div className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white" data-testid={`booking-program-${booking.id}`}>
                                    {booking.program_title}
                                  </h3>
                                  <Badge className={getBookingStatusColor(booking.status)}>
                                    {booking.status}
                                  </Badge>
                                  <Badge className={getPaymentStatusColor(booking.payment_status)}>
                                    {booking.payment_status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-zinc-400" data-testid={`booking-id-${booking.id}`}>
                                  Booking #{booking.id.substring(0, 8)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                  ₹{booking.amount}
                                </p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl" data-testid={`booking-details-${booking.id}`}>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Trainer</p>
                                <p className="font-medium text-white flex items-center gap-2" data-testid={`booking-trainer-${booking.id}`}>
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs text-white">
                                    {booking.trainer_name?.charAt(0)}
                                  </div>
                                  {booking.trainer_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Date & Time</p>
                                <p className="font-medium text-white flex items-center gap-2" data-testid={`booking-date-time-${booking.id}`}>
                                  <Calendar className="w-4 h-4 text-cyan-400" />
                                  {booking.booking_date}
                                  <Clock className="w-4 h-4 text-purple-400 ml-2" />
                                  {booking.time_slot}
                                </p>
                              </div>
                              {booking.notes && (
                                <div className="md:col-span-2">
                                  <p className="text-xs text-zinc-500 mb-1">Notes</p>
                                  <p className="text-sm text-zinc-300 bg-white/5 p-3 rounded-lg" data-testid={`booking-notes-${booking.id}`}>
                                    {booking.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            <p className="mt-4 text-xs text-zinc-500 flex items-center gap-2" data-testid={`booking-created-at-${booking.id}`}>
                              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                              Booked on {new Date(booking.created_at).toLocaleString()}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Achievement Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 px-4 py-2">
            <Gift className="w-4 h-4 mr-2" />
            You've earned 3 new achievements this week! 🏆
          </Badge>
        </motion.div>
      </div>
   </UserLayout>
  );
}