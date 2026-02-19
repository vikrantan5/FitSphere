import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dumbbell, Package, Calendar, ShoppingBag, User, LogOut, 
  Bell, ChevronRight, Clock, CheckCircle, XCircle, Truck
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      shipped: 'text-purple-600 bg-purple-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      success: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getBookingStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
      completed: 'text-blue-600 bg-blue-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  FitSphere
                </h1>
                <p className="text-xs text-gray-500">Your Wellness Journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              </button>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-2xl border-white/20 shadow-2xl mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 p-1 shadow-xl">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold text-gray-700">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-1">
                    Welcome back, {user.name}! 👋
                  </h2>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  {user.phone && <p className="text-sm text-gray-500">📱 {user.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/user/shop')}>
                  <ShoppingBag className="w-8 h-8 mb-2" />
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-sm opacity-90">Total Orders</div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-pink-500 to-orange-500 text-white hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/user/sessions')}>
                  <Calendar className="w-8 h-8 mb-2" />
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <div className="text-sm opacity-90">Total Bookings</div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="p-6 bg-white hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => navigate('/user/shop')}
            data-testid="shop-card"
          >
            <ShoppingBag className="w-12 h-12 text-violet-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Shop Products</h3>
            <p className="text-sm text-gray-600">Browse fitness equipment & supplements</p>
            <ChevronRight className="w-5 h-5 text-violet-600 mt-2" />
          </Card>

          <Card 
            className="p-6 bg-white hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => navigate('/user/sessions')}
            data-testid="sessions-card"
          >
            <Calendar className="w-12 h-12 text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Book Session</h3>
            <p className="text-sm text-gray-600">Schedule training with experts</p>
            <ChevronRight className="w-5 h-5 text-pink-600 mt-2" />
          </Card>

          <Card 
            className="p-6 bg-white hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => navigate('/user/videos')}
            data-testid="videos-card"
          >
            <Package className="w-12 h-12 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Training Videos</h3>
            <p className="text-sm text-gray-600">Access workout library</p>
            <ChevronRight className="w-5 h-5 text-orange-600 mt-2" />
          </Card>

          <Card 
            className="p-6 bg-white hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
            onClick={() => navigate('/user/cart')}
            data-testid="cart-card"
          >
            <ShoppingBag className="w-12 h-12 text-teal-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">My Cart</h3>
            <p className="text-sm text-gray-600">View cart items & checkout</p>
            <ChevronRight className="w-5 h-5 text-teal-600 mt-2" />
          </Card>
        </div>

        {/* Orders and Bookings Tabs */}
        <Card className="bg-white/90 backdrop-blur-xl shadow-xl">
          <Tabs defaultValue="orders" className="p-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="orders" className="text-lg" data-testid="orders-tab">
                <Package className="w-5 h-5 mr-2" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-lg" data-testid="bookings-tab">
                <Calendar className="w-5 h-5 mr-2" />
                My Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Button onClick={() => navigate('/user/shop')} className="bg-gradient-to-r from-violet-600 to-pink-600 text-white">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-6 hover:shadow-lg transition-all" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Order #{order.id.substring(0, 8)}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-violet-600">₹{order.total_amount}</div>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-gray-700">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-violet-600">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Customer Name</p>
                          <p className="font-medium">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium">{order.customer_phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Shipping Address</p>
                          <p className="font-medium">{order.shipping_address}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Button onClick={() => navigate('/user/sessions')} className="bg-gradient-to-r from-violet-600 to-pink-600 text-white">
                    Book a Session
                  </Button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 hover:shadow-lg transition-all" data-testid={`booking-${booking.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{booking.program_title}</h3>
                        <p className="text-sm text-gray-500">Booking #{booking.id.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600">₹{booking.amount}</div>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Trainer</p>
                        <p className="font-semibold text-gray-800">👤 {booking.trainer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                        <p className="font-semibold text-gray-800">
                          📅 {booking.booking_date} <Clock className="inline w-4 h-4 ml-2" /> {booking.time_slot}
                        </p>
                      </div>
                      {booking.notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Notes</p>
                          <p className="text-gray-700">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      Booked on: {new Date(booking.created_at).toLocaleString()}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
