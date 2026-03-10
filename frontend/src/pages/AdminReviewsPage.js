import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminReviewsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [searchQuery, filter, testimonials]);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API}/testimonials/all`, config);
      setTestimonials(response.data);
      setFilteredTestimonials(response.data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.approval_status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTestimonials(filtered);
  };

  const handleApprove = async (testimonialId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`${API}/testimonials/${testimonialId}/approve`, {}, config);
      toast.success('Review approved successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to approve review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (testimonialId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`${API}/testimonials/${testimonialId}/reject`, {}, config);
      toast.success('Review rejected');
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to reject review:', error);
      toast.error('Failed to reject review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-[#ff7f50] text-[#ff7f50]' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Loading reviews...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-reviews-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>User Reviews</h1>
            <p className="text-[#5a5a5a]">Manage and moderate user testimonials</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <Button
                  key={f}
                  onClick={() => setFilter(f)}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  className={filter === f ? 'bg-[#0f5132]' : ''}
                  data-testid={`filter-${f}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f5132]">
                  {testimonials.filter(t => t.approval_status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Pending Reviews</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f5132]">
                  {testimonials.filter(t => t.approval_status === 'approved').length}
                </p>
                <p className="text-sm text-gray-500">Approved Reviews</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f5132]">
                  {testimonials.filter(t => t.approval_status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-500">Rejected Reviews</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredTestimonials.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </Card>
          ) : (
            filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6" data-testid={`review-${testimonial.id}`}>
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#ff7f50]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0f5132]">{testimonial.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">{renderStars(testimonial.rating)}</div>
                          <span className="text-sm text-gray-500">({testimonial.rating}/5)</span>
                        </div>
                      </div>
                      {getStatusBadge(testimonial.approval_status)}
                    </div>

                    <p className="text-gray-700 mb-3 italic">"{testimonial.comment}"</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(testimonial.date || testimonial.created_at).toLocaleDateString()}</span>
                      </div>
                      {testimonial.service_type && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {testimonial.service_type}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {testimonial.approval_status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleApprove(testimonial.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`approve-btn-${testimonial.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(testimonial.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          data-testid={`reject-btn-${testimonial.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
