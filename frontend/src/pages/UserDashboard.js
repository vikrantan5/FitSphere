import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, User, Package, ShoppingBag, MessageCircle, Video, Dumbbell } from 'lucide-react';
import { authAPI, ordersAPI } from '../utils/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view dashboard');
      navigate('/login');
      return;
    }
    fetchUser();
    fetchOrders();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Session expired. Please login again.');
      handleLogout();
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('cart');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Dumbbell className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white" data-testid="profile-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
                <p className="text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card
            onClick={() => navigate('/user/sessions')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          >
            <Dumbbell className="h-10 w-10 mb-3" />
            <h3 className="font-bold text-lg">Book Session</h3>
            <p className="text-sm text-white/80">Find your perfect trainer</p>
          </Card>

          <Card
            onClick={() => navigate('/user/videos')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
          >
            <Video className="h-10 w-10 mb-3" />
            <h3 className="font-bold text-lg">Watch Videos</h3>
            <p className="text-sm text-white/80">Explore workouts</p>
          </Card>

          <Card
            onClick={() => navigate('/user/shop')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-teal-500 to-green-500 text-white"
          >
            <ShoppingBag className="h-10 w-10 mb-3" />
            <h3 className="font-bold text-lg">Shop Products</h3>
            <p className="text-sm text-white/80">Browse equipment</p>
          </Card>

          <Card
            onClick={() => navigate('/user/chat')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-orange-500 to-red-500 text-white"
          >
            <MessageCircle className="h-10 w-10 mb-3" />
            <h3 className="font-bold text-lg">Live Chat</h3>
            <p className="text-sm text-white/80">Get support</p>
          </Card>
        </div>

        {/* My Orders & Bookings */}
        <Card className="p-6">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="orders" data-testid="orders-tab">My Orders</TabsTrigger>
              <TabsTrigger value="profile" data-testid="profile-tab">My Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" data-testid="orders-content">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Order History</h2>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Button onClick={() => navigate('/user/sessions')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="p-6" data-testid="order-card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                            <Badge className={getStatusColor(order.order_status)}>
                              {order.order_status}
                            </Badge>
                            <Badge className={getStatusColor(order.payment_status)}>
                              Payment: {order.payment_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">₹{order.total_amount}</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t mt-4 pt-4">
                        <div className="text-sm text-gray-600">
                          <p><strong>Customer:</strong> {order.customer_name}</p>
                          <p><strong>Email:</strong> {order.customer_email}</p>
                          <p><strong>Phone:</strong> {order.customer_phone}</p>
                          <p><strong>Address:</strong> {order.shipping_address}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" data-testid="profile-content">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-lg font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg font-semibold">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-lg font-semibold">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Member Since</label>
                      <p className="text-lg font-semibold">
                        {user?.created_at && new Date(user.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}