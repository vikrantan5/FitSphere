import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Plus } from 'lucide-react';
import { testimonialAPI } from '../utils/api';
import { toast } from 'sonner';
import { UserLayout } from '@/components/user/UserLayout';

export default function UserTestimonialsPage() {
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
      const response = await testimonialAPI.getAll({
        approved_only: true,
        limit: 50
      });
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
      await testimonialAPI.create(newTestimonial);

      toast.success(
        'Thank you for your review! It will be published after approval.'
      );

      setIsModalOpen(false);

      setNewTestimonial({
        rating: 5,
        comment: '',
        service_type: 'session'
      });

      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout
      activePath="/user/testimonials"
      title="Community Reviews"
      subtitle="Read member experiences and share your own feedback after sessions, products, or videos."
      actions={
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
              data-testid="add-review-btn"
            >
              <Plus className="mr-2 h-4 w-4" />
              Write Review
            </Button>
          </DialogTrigger>

          <DialogContent
            className="border-white/10 bg-zinc-900 text-zinc-100"
            data-testid="add-review-modal"
          >
            <DialogHeader>
              <DialogTitle className="text-white">
                Share Your Experience
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Rating
                </label>

                <div
                  className="flex gap-2"
                  data-testid="review-rating-selector"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewTestimonial({
                          ...newTestimonial,
                          rating: star
                        })
                      }
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= newTestimonial.rating
                            ? 'fill-yellow-300 text-yellow-300'
                            : 'text-zinc-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Service Type
                </label>

                <Select
                  value={newTestimonial.service_type}
                  onValueChange={(value) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      service_type: value
                    })
                  }
                >
                  <SelectTrigger
                    className="border-white/10 bg-zinc-950/70"
                    data-testid="service-type-select"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-100">
                    <SelectItem value="session">
                      Training Session
                    </SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comment */}
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Your Review
                </label>

                <Textarea
                  value={newTestimonial.comment}
                  onChange={(e) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      comment: e.target.value
                    })
                  }
                  placeholder="Share your experience"
                  rows={5}
                  className="border-white/10 bg-zinc-950/70 text-zinc-100"
                  data-testid="review-textarea"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                data-testid="submit-review-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Testimonials List */}

      {loading ? (
        <Card
          className="saas-glass-card p-10 text-center"
          data-testid="testimonials-loading-card"
        >
          <p className="text-zinc-300">Loading testimonials...</p>
        </Card>
      ) : testimonials.length === 0 ? (
        <Card
          className="saas-glass-card p-10 text-center"
          data-testid="testimonials-empty-card"
        >
          <p className="text-zinc-300">
            No testimonials yet. Be the first to share your experience.
          </p>
        </Card>
      ) : (
        <div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-testid="testimonials-grid"
        >
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="saas-glass-card p-6"
              data-testid={`testimonial-card-${testimonial.id}`}
            >
              {/* Rating */}
              <div className="mb-4 flex items-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-300 text-yellow-300"
                  />
                ))}

                {[...Array(5 - testimonial.rating)].map((_, i) => (
                  <Star
                    key={`empty-${i}`}
                    className="h-5 w-5 text-zinc-600"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="mb-5 line-clamp-4 text-sm italic text-zinc-300">
                "{testimonial.comment}"
              </p>

              {/* User */}
              <div className="flex items-center border-t border-white/10 pt-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/20 text-lg font-bold text-cyan-200">
                  {testimonial.user_name.charAt(0)}
                </div>

                <div className="ml-3">
                  <p className="font-semibold text-white">
                    {testimonial.user_name}
                  </p>

                  <p className="text-sm capitalize text-zinc-400">
                    {testimonial.service_type}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}