import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [bookingData, setBookingData] = useState({ schedule: '', notes: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API}/bookings`,
        {
          program_id: selectedProgram.id,
          program_name: selectedProgram.name,
          ...bookingData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Booking request submitted successfully!');
      setIsDialogOpen(false);
      setBookingData({ schedule: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="programs-page">
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
              <Link to="/programs" className="text-sm uppercase tracking-widest text-[#0f5132]">Programs</Link>
              <Link to="/products" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Shop</Link>
              <Link to="/dashboard" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Dashboard</Link>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white rounded-full px-6 py-3 text-sm uppercase tracking-widest">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0f5132] mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="programs-page-title">
              Our Programs
            </h1>
            <p className="text-[#5a5a5a] text-base">Choose the perfect program for your fitness journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <Card key={program.id} className="bg-white border border-stone-100 overflow-hidden group hover:shadow-xl transition-all duration-500" data-testid={`program-card-${idx}`}>
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={program.image_url} alt={program.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-4 py-1 bg-[#0f5132] text-white text-xs uppercase tracking-widest rounded-full mb-3">{program.category}</span>
                  <h3 className="text-xl font-medium text-[#1a1a1a] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>{program.name}</h3>
                  <p className="text-[#5a5a5a] text-sm mb-4">{program.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-[#5a5a5a]">
                      <Clock className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span className="font-semibold text-[#0f5132]" data-testid={`program-price-${idx}`}>₹ {program.price}</span>
                    </div>
                  </div>
                  <Dialog open={isDialogOpen && selectedProgram?.id === program.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) setSelectedProgram(program);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-widest"
                        data-testid={`book-program-${idx}`}
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white rounded-none" data-testid="booking-dialog">
                      <DialogHeader>
                        <DialogTitle className="text-2xl" style={{fontFamily: 'Tenor Sans, serif'}}>Book {program.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBooking} className="space-y-6 mt-4">
                        <div>
                          <Label htmlFor="schedule" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Preferred Schedule</Label>
                          <Input
                            id="schedule"
                            type="datetime-local"
                            value={bookingData.schedule}
                            onChange={(e) => setBookingData({ ...bookingData, schedule: e.target.value })}
                            className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                            required
                            data-testid="booking-schedule-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any special requirements or questions..."
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                            className="bg-transparent border border-stone-300 rounded-none px-4 py-4 focus:border-[#0f5132] focus:ring-0 mt-2 min-h-[100px]"
                            data-testid="booking-notes-input"
                          />
                        </div>
                        <div className="bg-[#fef3e8] p-4 rounded-none">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#5a5a5a]">Program Price:</span>
                            <span className="font-semibold text-[#0f5132]">₹ {program.price}</span>
                          </div>
                          <div className="border-t border-stone-300 pt-2 flex justify-between">
                            <span className="font-medium text-[#1a1a1a]">Total:</span>
                            <span className="font-bold text-[#0f5132] text-lg">₹ {program.price}</span>
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-widest"
                          data-testid="confirm-booking-btn"
                        >
                          Confirm Booking
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}