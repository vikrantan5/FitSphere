import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dumbbell, Star, Plus } from 'lucide-react';
import { testimonialsAPI } from '../utils/api';
import { toast } from 'sonner';

export default function UserTestimonialsPage() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    rating: 5,
    comment: '',
    service_type: 'session'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsAPI.getAll({ approved_only: true, limit: 50 });
      setTestimonials(response.data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newTestimonial.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      await testimonialsAPI.create(newTestimonial);
      toast.success('Thank you for your review! It will be published after approval.');
      setIsModalOpen(false);
      setNewTestimonial({ rating: 5, comment: '', service_type: 'session' });
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
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
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600" data-testid="add-review-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="add-review-modal">
                  <DialogHeader>
                    <DialogTitle>Share Your Experience</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-8 w-8 cursor-pointer ${
                              star <= newTestimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Service Type</label>
                      <Select
                        value={newTestimonial.service_type}
                        onValueChange={(value) =>
                          setNewTestimonial({ ...newTestimonial, service_type: value })
                        }
                      >
                        <SelectTrigger data-testid="service-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session">Training Session</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review</label>
                      <Textarea
                        value={newTestimonial.comment}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, comment: e.target.value })
                        }
                        placeholder="Share your experience with us..."
                        rows={5}
                        data-testid="review-textarea"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      data-testid="submit-review-btn"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Member Testimonials
          </h1>
          <p className="text-xl text-gray-600">
            Real stories from our amazing community
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">Loading testimonials...</div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">No testimonials yet. Be the first to share your experience!</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="testimonials-grid">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:shadow-xl transition-shadow" data-testid="testimonial-card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic line-clamp-4">"{testimonial.comment}"</p>
                <div className="flex items-center border-t pt-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.user_name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">{testimonial.user_name}</div>
                    <div className="text-sm text-gray-500 capitalize">{testimonial.service_type}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
