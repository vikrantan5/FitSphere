import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Dumbbell, Home, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import LocationDisplay from '@/components/LocationDisplay';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getAll({ limit: 100 });
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status: newStatus });
      toast.success('Booking status updated');
      loadBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  return (
    <Layout>
      <div className="space-y-6" data-testid="bookings-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Training Session Bookings</h1>
            <p className="text-gray-600 mt-1">Manage customer bookings</p>
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </Card>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} data-testid={`booking-row-${booking.id}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {booking.user_name}
                          </div>
                          <div className="text-sm text-gray-500">{booking.user_email}</div>
                          {booking.user_phone && (
                            <div className="text-sm text-gray-500">{booking.user_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {booking.program_title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{booking.trainer_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.attendance_type === 'gym' ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Dumbbell className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">At Gym</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm">
                            <Home className="h-4 w-4 text-purple-600" />
                            <span className="text-purple-700 font-medium">Home Visit</span>
                          </div>
                        )}
                        {/* Show location indicator */}
                        {booking.attendance_type === 'gym' && booking.gym_location && (
                          <div className="text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            Gym Location
                          </div>
                        )}
                        {booking.attendance_type === 'home_visit' && booking.user_location && (
                          <div className="text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            User Location
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{booking.booking_date}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {booking.time_slot}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          ₹{booking.amount}
                        </span>
                        <div className={`text-xs mt-1 ${booking.payment_status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {booking.payment_status === 'success' ? '✓ Paid' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                                data-testid={`confirm-booking-${booking.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                data-testid={`cancel-booking-${booking.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No bookings found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
