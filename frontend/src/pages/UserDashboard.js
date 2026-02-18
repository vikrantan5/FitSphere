import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Clock, LogOut, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view dashboard');
      navigate('/login');
      return;
    }
    fetchUser();
    fetchBookings();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/orders/user/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'success':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="user-dashboard">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-stone-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere</h1>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Home</Link>
              <Link to="/programs" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Programs</Link>
              <Link to="/products" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Shop</Link>
              <Link to="/dashboard" className="text-sm uppercase tracking-widest text-[#0f5132]">Dashboard</Link>
            </div>
            <Button onClick={handleLogout} className="bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white rounded-full px-6 py-3 text-sm uppercase tracking-widest flex items-center gap-2" data-testid="logout-btn">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-[#0f5132] to-[#0f5132]/90 border-0 p-8 text-white" data-testid="user-info-card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-normal mb-1" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="user-name">{user?.name}</h2>
                  <p className="text-white/80" data-testid="user-email">{user?.email}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-8">
            <h3 className="text-3xl font-normal text-[#0f5132] mb-2" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="my-bookings-title">
              My Orders
            </h3>
            <p className="text-[#5a5a5a]">Track your product orders</p>
          </div>

          {bookings.length === 0 ? (
            <Card className="bg-white border border-stone-100 p-12 text-center" data-testid="no-bookings">
              <div className="max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-[#0f5132] mx-auto mb-4" />
                <h4 className="text-xl font-medium text-[#1a1a1a] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>No Orders Yet</h4>
                <p className="text-[#5a5a5a] mb-6">Start shopping and place your first order</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((order, idx) => (
                <Card key={order.id} className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all" data-testid={`booking-card-${idx}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-[#1a1a1a]" style={{fontFamily: 'Tenor Sans, serif'}} data-testid={`booking-program-${idx}`}>
                        Order #{order.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-[#5a5a5a]">{order.customer_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getStatusColor(order.order_status)}`} data-testid={`booking-status-${idx}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="border-t border-stone-200 pt-3">
                      <p className="text-sm text-[#5a5a5a] mb-2">Items:</p>
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-sm mb-1">
                          <span className="text-[#1a1a1a]">{item.product_name} x {item.quantity}</span>
                          <span className="text-[#1a1a1a]">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-stone-200 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#1a1a1a]">Total Amount:</span>
                        <span className="text-lg font-bold text-[#0f5132]">₹{order.total_amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span className="text-[#5a5a5a]">Ordered on: </span>
                      <span className="ml-1 text-[#1a1a1a]">{new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="pt-3 border-t border-stone-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#5a5a5a]">Payment:</span>
                        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getStatusColor(order.payment_status)}`} data-testid={`payment-status-${idx}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}