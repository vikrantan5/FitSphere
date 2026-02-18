import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ShoppingBag, Video, Star, MessageCircle, Dumbbell, Heart, Users, Award } from 'lucide-react';
import { videoAPI, productAPI, testimonialAPI } from '../utils/api';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, sessionsRes, testimonialsRes] = await Promise.all([
        videoAPI.getAll({ limit: 4 }),
        productAPI.getAll({ limit: 4 }),
        testimonialAPI.getAll({ limit: 6, approved_only: true })
      ]);
      
      setVideos(videosRes.data);
      setSessions(sessionsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/user/sessions');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/user/sessions" className="text-gray-700 hover:text-purple-600 font-medium transition">
                Sessions
              </Link>
              <Link to="/user/videos" className="text-gray-700 hover:text-purple-600 font-medium transition">
                Videos
              </Link>
              <Link to="/user/shop" className="text-gray-700 hover:text-purple-600 font-medium transition">
                Shop
              </Link>
              <Link to="/user/testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition">
                Reviews
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {localStorage.getItem('token') ? (
                <>
                  <Button onClick={() => navigate('/user/dashboard')} variant="outline">
                    Dashboard
                  </Button>
                  <Button onClick={() => navigate('/user/cart')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} variant="outline">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
              <Star className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-purple-800 font-medium">Women-Centric Fitness Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Transform Your <br />Fitness Journey
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Personalized training sessions, expert-led workout videos, and premium fitness products - 
              all in one place. Designed exclusively for women.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted} 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-lg px-8 py-6 hover:shadow-lg hover:scale-105 transition-all"
                data-testid="get-started-btn"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
                Start Your Journey
              </Button>
              
              <Button 
                onClick={() => navigate('/user/videos')}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-purple-600 hover:bg-purple-50"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Videos
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">100+</div>
                <div className="text-gray-600">Workout Videos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600">Expert Trainers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose FitSphere?</h2>
            <p className="text-xl text-gray-600">Everything you need for your fitness journey in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Personal Training</h3>
              <p className="text-gray-600">
                One-on-one sessions with certified trainers. Customized programs tailored to your goals and fitness level.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-200">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Video className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Workout Videos</h3>
              <p className="text-gray-600">
                Access hundreds of professional workout videos. From yoga to HIIT, find the perfect routine for you.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fitness Products</h3>
              <p className="text-gray-600">
                Shop premium fitness equipment, apparel, and supplements. Everything you need delivered to your door.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Sessions Preview */}
      {sessions.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2 text-gray-900">Popular Sessions</h2>
                <p className="text-xl text-gray-600">Book your personalized training session today</p>
              </div>
              <Button onClick={() => navigate('/user/sessions')} variant="outline" className="hidden md:flex">
                View All Sessions
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sessions.slice(0, 4).map((session) => (
                <Card key={session.id} className="overflow-hidden hover:shadow-xl transition-all hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Dumbbell className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{session.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">₹{session.price}</span>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workout Videos Preview */}
      {videos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2 text-gray-900">Featured Workouts</h2>
                <p className="text-xl text-gray-600">Expert-led video tutorials for all levels</p>
              </div>
              <Button onClick={() => navigate('/user/videos')} variant="outline" className="hidden md:flex">
                Browse All Videos
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.slice(0, 4).map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center group">
                    <Play className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {Math.floor(video.duration / 60)} min
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-purple-600 font-semibold mb-2 uppercase">{video.category}</div>
                    <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="capitalize">{video.difficulty}</span>
                      <span>{video.view_count} views</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">What Our Members Say</h2>
              <p className="text-xl text-gray-600">Real stories from real women transforming their lives</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Transformation?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of women who have already transformed their lives with FitSphere. 
            Your journey to a healthier, stronger you starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Heart className="h-5 w-5 mr-2" />
              Join FitSphere Now
            </Button>
            <Button 
              onClick={() => navigate('/user/chat')}
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">FitSphere</span>
              </div>
              <p className="text-gray-400">
                Empowering women through fitness, one session at a time.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/user/sessions" className="hover:text-purple-400 transition">Training Sessions</Link></li>
                <li><Link to="/user/videos" className="hover:text-purple-400 transition">Workout Videos</Link></li>
                <li><Link to="/user/shop" className="hover:text-purple-400 transition">Shop Products</Link></li>
                <li><Link to="/user/dashboard" className="hover:text-purple-400 transition">My Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/user/chat" className="hover:text-purple-400 transition">Live Chat</Link></li>
                <li><Link to="/user/testimonials" className="hover:text-purple-400 transition">Testimonials</Link></li>
                <li><a href="#" className="hover:text-purple-400 transition">FAQs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <p className="text-gray-400 mb-2">support@fitsphere.com</p>
              <p className="text-gray-400">+91 (123) 456-7890</p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FitSphere. All rights reserved. Made with ❤️ for women's wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
