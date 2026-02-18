import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dumbbell, Clock, Users, Star, Calendar, Search, CheckCircle } from 'lucide-react';
import { programAPI, trainerAPI, bookingAPI } from '../utils/api';
import { toast } from 'sonner';

export default function UserSessionsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
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
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchQuery, categoryFilter]);

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

  const filterPrograms = () => {
    let filtered = programs;

    if (searchQuery) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(program => program.category === categoryFilter);
    }

    setFilteredPrograms(filtered);
  };

  const handleBookProgram = (program) => {
    setSelectedProgram(program);
    setShowBookingModal(true);
    setBookingForm({ booking_date: '', time_slot: '', notes: '' });
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProgram || !selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }

    try {
      await bookingAPI.create({
        program_id: selectedProgram.id,
        trainer_id: selectedTrainer,
        booking_date: bookingForm.booking_date,
        time_slot: bookingForm.time_slot,
        notes: bookingForm.notes
      });

      toast.success('Session booked successfully!');
      setShowBookingModal(false);
      fetchData();
    } catch (error) {
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
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.payment_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {booking.payment_status === 'success' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
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
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">Loading programs...</div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">No programs found</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="programs-grid">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105" data-testid="program-card">
                <div className="h-56 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center relative">
                  {program.image_url ? (
                    <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell className="h-20 w-20 text-white/80" />
                  )}
                  <span className={`absolute top-4 right-4 px-3 py-1 text-xs rounded-full font-semibold ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-purple-600 font-semibold mb-2 uppercase">
                    {program.category}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-purple-600">₹{program.price}</span>
                      <span className="text-sm text-gray-500 ml-2">/{program.duration_weeks} weeks</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{program.enrolled_count} enrolled</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Trainer: {getTrainerName(program.trainer_id)}</p>
                    <p className="text-xs text-gray-500">{program.sessions_per_week} sessions/week</p>
                  </div>

                  <Button
                    onClick={() => handleBookProgram(program)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={!program.is_active}
                    data-testid="book-session-btn"
                  >
                    {program.is_active ? 'Book Session' : 'Unavailable'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Training Session</DialogTitle>
          </DialogHeader>
          
          {selectedProgram && (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <Label>Program</Label>
                <Input value={selectedProgram.title} disabled className="bg-gray-50" />
              </div>

              <div>
                <Label htmlFor="trainer">Select Trainer *</Label>
                <Select value={selectedTrainer} onValueChange={handleTrainerChange} required>
                  <SelectTrigger id="trainer" data-testid="trainer-select">
                    <SelectValue placeholder="Choose a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(trainer => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="booking_date">Booking Date *</Label>
                <Input
                  id="booking_date"
                  type="date"
                  value={bookingForm.booking_date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="booking-date"
                />
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <Label htmlFor="time_slot">Available Time Slots *</Label>
                  <Select 
                    value={bookingForm.time_slot} 
                    onValueChange={(value) => setBookingForm({ ...bookingForm, time_slot: value })}
                    required
                  >
                    <SelectTrigger id="time_slot" data-testid="time-slot-select">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bookingForm.booking_date && selectedTrainer && availableSlots.length === 0 && (
                <p className="text-sm text-red-600">No available slots for this date. Please choose another date.</p>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any special requirements or questions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={!bookingForm.time_slot || availableSlots.length === 0}
                  data-testid="confirm-booking-btn"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
