import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Users, DollarSign, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingUpdate, setBookingUpdate] = useState({ booking_status: '', payment_status: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login as admin');
      navigate('/login');
      return;
    }
    fetchUser();
    fetchMetrics();
    fetchBookings();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.role !== 'admin') {
        toast.error('Admin access required');
        navigate('/dashboard');
        return;
      }
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const fetchMetrics = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API}/bookings/${selectedBooking.id}`,
        bookingUpdate,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Booking updated successfully');
      setIsDialogOpen(false);
      fetchBookings();
      fetchMetrics();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterBookings = (status) => {
    if (status === 'all') return bookings;
    return bookings.filter(b => b.booking_status === status);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="admin-dashboard">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0f5132] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal text-white" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere Admin</h1>
              </div>
            </div>
            <Button onClick={handleLogout} className="bg-white text-[#0f5132] hover:bg-white/90 rounded-full px-6 py-3 text-sm uppercase tracking-widest flex items-center gap-2" data-testid="admin-logout-btn">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-normal text-[#0f5132] mb-2" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="admin-welcome">Welcome, {user?.name}</h2>
            <p className="text-[#5a5a5a]">Manage your fitness platform</p>
          </div>

          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all" data-testid="metric-total-bookings">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0f5132]/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#0f5132]" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm uppercase tracking-wider text-[#5a5a5a] mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-[#0f5132]" data-testid="total-bookings-count">{metrics.total_bookings}</p>
              </Card>

              <Card className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all" data-testid="metric-revenue">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#ff7f50]/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#ff7f50]" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm uppercase tracking-wider text-[#5a5a5a] mb-1">Revenue</p>
                <p className="text-3xl font-bold text-[#ff7f50]" data-testid="revenue-count">₹ {metrics.revenue.toLocaleString()}</p>
              </Card>

              <Card className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all" data-testid="metric-pending">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-700" />
                  </div>
                </div>
                <p className="text-sm uppercase tracking-wider text-[#5a5a5a] mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-700" data-testid="pending-count">{metrics.pending_requests}</p>
              </Card>

              <Card className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all" data-testid="metric-today">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#d4af37]" />
                  </div>
                </div>
                <p className="text-sm uppercase tracking-wider text-[#5a5a5a] mb-1">Today's Sessions</p>
                <p className="text-3xl font-bold text-[#d4af37]" data-testid="today-sessions-count">{metrics.todays_sessions}</p>
              </Card>
            </div>
          )}

          <Card className="bg-white border border-stone-100 p-8" data-testid="bookings-management">
            <h3 className="text-2xl font-normal text-[#0f5132] mb-6" style={{fontFamily: 'Tenor Sans, serif'}}>Booking Management</h3>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-stone-100 rounded-none mb-8">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#0f5132] data-[state=active]:text-white" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white" data-testid="tab-pending">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white" data-testid="tab-approved">Approved</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-600 data-[state=active]:text-white" data-testid="tab-cancelled">Cancelled</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {filterBookings(status).length === 0 ? (
                    <div className="text-center py-12 text-[#5a5a5a]" data-testid={`no-bookings-${status}`}>
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No {status !== 'all' ? status : ''} bookings</p>
                    </div>
                  ) : (
                    filterBookings(status).map((booking, idx) => (
                      <Card key={booking.id} className="border border-stone-200 p-6 hover:shadow-md transition-all" data-testid={`booking-item-${idx}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-medium text-[#1a1a1a] mb-1" style={{fontFamily: 'Tenor Sans, serif'}} data-testid={`booking-program-${idx}`}>{booking.program_name}</h4>
                                <p className="text-sm text-[#5a5a5a]" data-testid={`booking-user-${idx}`}>{booking.user_name} • {booking.user_email}</p>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getStatusColor(booking.booking_status)}`} data-testid={`booking-status-${idx}`}>
                                  {booking.booking_status}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getStatusColor(booking.payment_status)}`} data-testid={`payment-status-${idx}`}>
                                  {booking.payment_status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-[#5a5a5a]">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-[#0f5132]" />
                                <span data-testid={`booking-schedule-${idx}`}>{new Date(booking.schedule).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-[#0f5132]" />
                                <span>Booked: {new Date(booking.created_at).toLocaleDateString('en-US', { dateStyle: 'short' })}</span>
                              </div>
                            </div>
                            {booking.notes && (
                              <div className="mt-3 p-3 bg-[#fef3e8] rounded-none text-sm text-[#5a5a5a]">
                                <span className="font-medium text-[#1a1a1a]">Notes: </span>{booking.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex md:flex-col gap-2">
                            <Dialog open={isDialogOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (open) {
                                setSelectedBooking(booking);
                                setBookingUpdate({ booking_status: booking.booking_status, payment_status: booking.payment_status });
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button className="bg-[#0f5132] hover:bg-[#0f5132]/90 text-white rounded-full px-6 py-2 text-sm" data-testid={`update-booking-${idx}`}>
                                  Update Status
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-white rounded-none" data-testid="update-dialog">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl" style={{fontFamily: 'Tenor Sans, serif'}}>Update Booking</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateBooking} className="space-y-6 mt-4">
                                  <div>
                                    <Label htmlFor="booking_status" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Booking Status</Label>
                                    <Select value={bookingUpdate.booking_status} onValueChange={(value) => setBookingUpdate({ ...bookingUpdate, booking_status: value })}>
                                      <SelectTrigger className="mt-2 rounded-none" data-testid="booking-status-select">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="payment_status" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Payment Status</Label>
                                    <Select value={bookingUpdate.payment_status} onValueChange={(value) => setBookingUpdate({ ...bookingUpdate, payment_status: value })}>
                                      <SelectTrigger className="mt-2 rounded-none" data-testid="payment-status-select">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-widest"
                                    data-testid="confirm-update-btn"
                                  >
                                    Update Booking
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}