import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dumbbell, Clock, Users, Star, Calendar, Search, CheckCircle, MapPin, Home } from 'lucide-react';
import { programAPI, trainerAPI, bookingAPI } from '../utils/api';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';
import LocationDisplay from '@/components/LocationDisplay';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserSessionsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [gymSettings, setGymSettings] = useState(null);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    time_slot: '',
    attendance_type: 'gym',
    user_location: null,
    notes: ''
  });


    const [payingBookingId, setPayingBookingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchGymSettings();
      // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const filterPrograms = useCallback(() => {
    let filtered = programs;

    if (searchQuery) {
      filtered = filtered.filter(program =>
        program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(program => program.category === categoryFilter);
    }

    setFilteredPrograms(filtered);
  }, [programs, searchQuery, categoryFilter]);

  useEffect(() => {
    filterPrograms();
  }, [filterPrograms]);

  const fetchGymSettings = async () => {
    try {
      const response = await axios.get(`${API}/gym-settings`);
      setGymSettings(response.data);
    } catch (error) {
      console.error('Failed to load gym settings:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [programsRes, trainersRes, bookingsRes] = await Promise.all([
        programAPI.getAll({ limit: 100 }),
        trainerAPI.getAll({ is_active: true, limit: 100 }),
        bookingAPI.getMyBookings({ limit: 100 })
      ]);
      
      setPrograms(programsRes.data);
      setTrainers(trainersRes.data);
      setMyBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleBookProgram = (program) => {
    setSelectedProgram(program);
    setShowBookingModal(true);
    
    // Set default attendance type based on program support
    const defaultType = program.supports_gym_attendance ? 'gym' : 'home_visit';
    
    setBookingForm({ 
      booking_date: '', 
      time_slot: '', 
      attendance_type: defaultType,
      user_location: null,
      notes: '' 
    });
    setAvailableSlots([]);
    setSelectedTrainer(program.trainer_id || '');
  };

  const fetchAvailableSlots = async (trainerId, date) => {
    if (!trainerId || !date) return;
    
    try {
      const response = await bookingAPI.getAvailableSlots(trainerId, date);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleDateChange = (date) => {
    setBookingForm({ ...bookingForm, booking_date: date, time_slot: '' });
    if (selectedTrainer && date) {
      fetchAvailableSlots(selectedTrainer, date);
    }
  };

  const handleTrainerChange = (trainerId) => {
    setSelectedTrainer(trainerId);
    if (bookingForm.booking_date && trainerId) {
      fetchAvailableSlots(trainerId, bookingForm.booking_date);
    }
  };

  const handleLocationChange = (location) => {
    setBookingForm({ ...bookingForm, user_location: location });
  };


  const handlePayForBooking = async (booking) => {
    try {
      setPayingBookingId(booking.id);
      
      // Create payment for the booking
      const paymentResponse = await bookingAPI.createPayment(booking.id);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setPayingBookingId(null);
        return;
      }
      
      // Initialize Razorpay
      const options = {
        key: paymentResponse.data.razorpay_key_id,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'FitSphere',
        description: `Training Session: ${booking.program_title}`,
        order_id: paymentResponse.data.razorpay_order_id,
        handler: async function (paymentResult) {
          try {
            // Create FormData and append payment details
            const verifyData = new FormData();
            verifyData.append('razorpay_order_id', paymentResult.razorpay_order_id);
            verifyData.append('razorpay_payment_id', paymentResult.razorpay_payment_id);
            verifyData.append('razorpay_signature', paymentResult.razorpay_signature);

            await bookingAPI.verifyPayment(booking.id, verifyData);
            
            toast.success('Payment successful!');
            setPayingBookingId(null);
            fetchData(); // Refresh bookings list
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            setPayingBookingId(null);
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}').name || '',
          email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
          contact: JSON.parse(localStorage.getItem('user') || '{}').phone || ''
        },
        theme: {
          color: '#9333ea'
        },
        modal: {
          ondismiss: function() {
            setPayingBookingId(null);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
      setPayingBookingId(null);
    }
  };

  const calculateTotalAmount = () => {
    if (!selectedProgram) return 0;
    const basePrice = selectedProgram.price || 0;
    const additionalCharge = (bookingForm.attendance_type === 'home_visit') 
      ? (selectedProgram.home_visit_additional_charge || 0) 
      : 0;
    return basePrice + additionalCharge;
  };

    const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProgram || !selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }

    // Validate location for home visits
    if (bookingForm.attendance_type === 'home_visit') {
      if (!bookingForm.user_location || !bookingForm.user_location.address) {
        toast.error('Please provide your location for home visit');
        return;
      }
    }

    try {
      const payload = {
        program_id: selectedProgram.id,
        trainer_id: selectedTrainer,
        booking_date: bookingForm.booking_date,
        time_slot: bookingForm.time_slot,
        attendance_type: bookingForm.attendance_type,
        user_location: bookingForm.attendance_type === 'home_visit' ? bookingForm.user_location : undefined,
        notes: bookingForm.notes
      };

      const bookingResponse = await bookingAPI.create(payload);
      const bookingId = bookingResponse.data.id;

      toast.success('Session booked successfully! Proceeding to payment...');
      
      // Create payment for the booking
      const paymentResponse = await bookingAPI.createPayment(bookingId);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        return;
      }
      
      // Initialize Razorpay
      const options = {
        key: paymentResponse.data.razorpay_key_id,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'FitSphere',
        description: `Training Session: ${selectedProgram.title}`,
        order_id: paymentResponse.data.razorpay_order_id,
        handler: async function (paymentResult) {
          try {
            // Create FormData and append payment details
            const verifyData = new FormData();
            verifyData.append('razorpay_order_id', paymentResult.razorpay_order_id);
            verifyData.append('razorpay_payment_id', paymentResult.razorpay_payment_id);
            verifyData.append('razorpay_signature', paymentResult.razorpay_signature);

            await bookingAPI.verifyPayment(bookingId, verifyData);
            
            toast.success('Payment successful! Session booked.');
            setShowBookingModal(false);
            fetchData(); // Refresh bookings list
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}').name || '',
          email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
          contact: JSON.parse(localStorage.getItem('user') || '{}').phone || ''
        },
        theme: {
          color: '#9333ea'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled. Your booking is saved, you can pay later.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.detail || 'Failed to book session');
    }
  };

  const categories = ['all', 'Yoga', 'Cardio', 'Strength', 'Pilates', 'Dance', 'Meditation'];

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer?.name || 'Unknown Trainer';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/user/dashboard')} variant="outline">Dashboard</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Personal Training Sessions
          </h1>
          <p className="text-xl text-gray-600">
            Book one-on-one sessions with certified trainers
          </p>
        </div>

        {/* My Bookings Section */}
        {myBookings.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              My Bookings
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBookings.map((booking) => (
                <Card key={booking.id} className="p-4" data-testid="my-booking-card">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{booking.program_title}</h3>
                    <p className="text-sm text-gray-600">Trainer: {booking.trainer_name}</p>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {booking.booking_date} at {booking.time_slot}
                    </p>
                    
                    {/* Attendance Mode Display */}
                    <div className="flex items-center gap-1 text-sm">
                      {booking.attendance_type === 'gym' ? (
                        <><Dumbbell className="h-4 w-4 text-emerald-600" /> <span className="text-emerald-600 font-medium">At Gym</span></>
                      ) : (
                        <><Home className="h-4 w-4 text-purple-600" /> <span className="text-purple-600 font-medium">Home Visit</span></>
                      )}
                    </div>
                    
                    {/* Location Display */}
                    {booking.attendance_type === 'gym' && booking.gym_location && (
                      <div className="mt-2">
                        <LocationDisplay location={booking.gym_location} title="Gym Location" />
                      </div>
                    )}
                    {booking.attendance_type === 'home_visit' && booking.user_location && (
                      <div className="mt-2">
                        <LocationDisplay location={booking.user_location} title="Your Location" />
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.payment_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {booking.payment_status === 'success' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-semibold text-purple-600">₹{booking.amount}</p>

                      {/* Pay Now Button for Pending Payments */}
                    {booking.payment_status !== 'success' && booking.status !== 'cancelled' && (
                      <Button
                        onClick={() => handlePayForBooking(booking)}
                        disabled={payingBookingId === booking.id}
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600"
                        data-testid="pay-now-btn"
                      >
                        {payingBookingId === booking.id ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Programs Grid */}
        {loading ? (
          <div className="text-center py-12">Loading programs...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid="program-card">
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                  {program.image_url && (
                    <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full font-semibold ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2" data-testid="program-title">{program.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Trainer: {getTrainerName(program.trainer_id)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      <span>{program.duration_weeks} weeks • {program.sessions_per_week}x/week</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-purple-600 text-lg">₹{program.price}</span>
                      {program.supports_home_visit && program.home_visit_additional_charge > 0 && (
                        <span className="ml-2 text-xs text-gray-500">(+₹{program.home_visit_additional_charge} home)</span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Options */}
                  <div className="flex gap-2 mb-4">
                    {program.supports_gym_attendance && (
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        🏋️ Gym
                      </span>
                    )}
                    {program.supports_home_visit && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                        🏠 Home Visit
                      </span>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleBookProgram(program)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="book-now-button"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredPrograms.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No programs found matching your criteria
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session: {selectedProgram?.title}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Attendance Type Selection */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Select Attendance Mode</Label>
              <RadioGroup 
                value={bookingForm.attendance_type} 
                onValueChange={(value) => setBookingForm({ ...bookingForm, attendance_type: value })}
                className="space-y-3"
              >
                {selectedProgram?.supports_gym_attendance && (
                  <div className="flex items-center space-x-2 border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                    <RadioGroupItem value="gym" id="gym" />
                    <label htmlFor="gym" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-900">Attend at Gym</span>
                      </div>
                      <p className="text-sm text-emerald-700 ml-7">Come to our gym location</p>
                      <p className="text-sm font-semibold text-emerald-800 ml-7 mt-1">₹{selectedProgram?.price}</p>
                    </label>
                  </div>
                )}

                {selectedProgram?.supports_home_visit && (
                  <div className="flex items-center space-x-2 border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <RadioGroupItem value="home_visit" id="home_visit" />
                    <label htmlFor="home_visit" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">Trainer Visits Your Home</span>
                      </div>
                      <p className="text-sm text-purple-700 ml-7">Personal training at your location</p>
                      <p className="text-sm font-semibold text-purple-800 ml-7 mt-1">
                        ₹{(selectedProgram?.price || 0) + (selectedProgram?.home_visit_additional_charge || 0)}
                        {selectedProgram?.home_visit_additional_charge > 0 && (
                          <span className="text-xs ml-1">(+₹{selectedProgram?.home_visit_additional_charge})</span>
                        )}
                      </p>
                    </label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Gym Location Display */}
            {bookingForm.attendance_type === 'gym' && gymSettings?.gym_location && (
              <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                <LocationDisplay 
                  location={gymSettings.gym_location} 
                  title="Gym Location" 
                />
              </div>
            )}

            {/* Home Visit Location Picker */}
            {bookingForm.attendance_type === 'home_visit' && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <LocationPicker
                  label="Your Home Location"
                  initialLocation={bookingForm.user_location}
                  onLocationChange={handleLocationChange}
                />
              </div>
            )}

            {/* Trainer Selection */}
            <div>
              <Label>Select Trainer</Label>
              <Select value={selectedTrainer} onValueChange={handleTrainerChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a trainer" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.filter(t => t.is_active).map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name} - {trainer.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div>
              <Label>Booking Date</Label>
              <Input
                type="date"
                value={bookingForm.booking_date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2"
                required
              />
            </div>

            {/* Time Slot Selection */}
            {availableSlots.length > 0 && (
              <div>
                <Label>Available Time Slots</Label>
                <Select value={bookingForm.time_slot} onValueChange={(value) => setBookingForm({ ...bookingForm, time_slot: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Any special requirements or notes..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Total Amount */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total Amount:</span>
                <span className="font-bold text-2xl text-purple-600">₹{calculateTotalAmount()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={!bookingForm.booking_date || !bookingForm.time_slot || !selectedTrainer}
              >
                Confirm Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
