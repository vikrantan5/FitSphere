import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Heart, Star, Sparkles, Phone, Mail, Instagram, Facebook, Twitter, ShoppingCart, Calendar, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserLandingPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, programsRes, productsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/videos`, { params: { limit: 4 } }),
        axios.get(`${API}/programs`, { params: { limit: 4, is_active: true } }),
        axios.get(`${API}/products`, { params: { limit: 4 } }),
        axios.get(`${API}/testimonials`, { params: { limit: 6, approved_only: true } })
      ]);
      
      setVideos(videosRes.data);
      setPrograms(programsRes.data);
      setProducts(productsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'user') {
      navigate('/user/dashboard');
    } else if (token && userRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  FitSphere
                </span>
                <p className="text-xs text-gray-600">Elevate Your Wellness</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-violet-600 font-medium transition">
                Home
              </a>
              <a href="#videos" className="text-gray-700 hover:text-violet-600 font-medium transition">
                Videos
              </a>
              <a href="#programs" className="text-gray-700 hover:text-violet-600 font-medium transition">
                Programs
              </a>
              <a href="#products" className="text-gray-700 hover:text-violet-600 font-medium transition">
                Shop
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-violet-600 font-medium transition">
                Testimonials
              </a>
            </div>

            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 hover:opacity-90 text-white rounded-full px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-pink-100 to-orange-100 opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-2 bg-white/50 backdrop-blur-md rounded-full mb-8 border border-white shadow-lg">
              <Sparkles className="h-4 w-4 text-violet-600 mr-2" />
              <span className="text-gray-700 font-medium tracking-wide">Premium Wellness Experience</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
              FITSPHERE
            </h1>
            
            <p className="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed">
              Where Strength Meets Wellness
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Personalized fitness, smart booking, and real-time progress tracking for your wellness journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 hover:opacity-90 text-white text-lg px-10 py-7 rounded-full shadow-2xl hover:scale-105 transition-all"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Session
              </Button>
              
              <Button 
                onClick={() => navigate('/user/shop')}
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 rounded-full border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Explore Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      {videos.length > 0 && (
        <section id="videos" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Featured Workouts
              </h2>
              <p className="text-xl text-gray-600">Discover our most popular training programs</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-white rounded-2xl group"
                  onClick={() => navigate('/user/videos')}
                  data-testid={`video-card-${video.id}`}
                >
                  <div className="relative h-64 bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="h-20 w-20 text-white group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-pink-600 mr-2" />
                        <span className="text-sm font-semibold text-gray-700">{video.view_count || 0} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-violet-600 mb-2">{video.category}</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description?.substring(0, 80)}...</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{Math.floor(video.duration / 60)} min</span>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                        {video.difficulty}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/user/videos')}
                className="bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 rounded-full px-10 py-6 text-lg font-semibold"
                data-testid="view-all-videos-btn"
              >
                View All Training Videos
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Programs/Services Section */}
      {programs.length > 0 && (
        <section id="programs" className="py-20 bg-gradient-to-br from-violet-50 to-pink-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Fitness Programs
              </h2>
              <p className="text-xl text-gray-600">Tailored fitness programs designed for every goal</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {programs.map((program) => (
                <Card 
                  key={program.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 bg-white rounded-2xl group"
                  data-testid={`program-card-${program.id}`}
                >
                  <div className="relative h-72 overflow-hidden">
                    {program.image_url ? (
                      <img 
                        src={program.image_url} 
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Award className="h-20 w-20 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {program.category}
                    </div>
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {program.difficulty}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Starting from</div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{program.price}
                        </span>
                      </div>
                      <Button 
                        onClick={handleGetStarted}
                        className="bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 text-white rounded-full"
                      >
                        Book Now
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>📅 {program.duration_weeks} weeks</span>
                      <span>🏋️ {program.sessions_per_week}x/week</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <section id="products" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Fitness Products
              </h2>
              <p className="text-xl text-gray-600">Premium equipment and supplements for your wellness journey</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 bg-white rounded-2xl group cursor-pointer"
                  onClick={() => navigate('/user/shop')}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {product.image_urls && product.image_urls[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
                        <ShoppingCart className="h-20 w-20 text-white" />
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-violet-600 mb-2">{product.category}</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount > 0 ? (
                          <>
                            <span className="text-lg text-gray-400 line-through mr-2">₹{product.price}</span>
                            <span className="text-2xl font-bold text-violet-600">
                              ₹{(product.price * (1 - product.discount / 100)).toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-violet-600">₹{product.price}</span>
                        )}
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetStarted();
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 text-white rounded-full"
                      >
                        Add to Cart
                      </Button>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-medium">✓ In Stock ({product.stock})</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ Out of Stock</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/user/shop')}
                className="bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 rounded-full px-10 py-6 text-lg font-semibold"
                data-testid="view-all-products-btn"
              >
                Browse All Products
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600">Real transformations from real women</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {testimonials.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-lg p-10 shadow-2xl rounded-3xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex mb-4">
                      {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xl text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonials[currentTestimonial]?.comment}"
                    </p>
                    <div>
                      <p className="font-bold text-lg text-gray-800">{testimonials[currentTestimonial]?.user_name}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentTestimonial]?.service_type}</p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center mt-8 space-x-4">
                    <Button 
                      onClick={prevTestimonial} 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                    >
                      ←
                    </Button>
                    <div className="flex space-x-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentTestimonial 
                              ? 'w-8 bg-violet-600' 
                              : 'w-2 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Button 
                      onClick={nextTestimonial} 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                    >
                      →
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-5xl font-bold mb-6">
              Start Your Fitness Transformation Today
            </h2>
            <p className="text-xl mb-10 text-white/90">
              Book sessions, track progress, and achieve your goals with expert guidance
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-violet-600 hover:bg-gray-100 text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-all font-semibold"
              data-testid="cta-reserve-btn"
            >
              Reserve Your Slot
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-4">
                FitSphere
              </h3>
              <p className="text-gray-400">
                Empowering women through premium fitness and wellness experiences. Join our community today.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#programs" className="hover:text-violet-400 transition">Programs</a></li>
                <li><a href="#products" className="hover:text-violet-400 transition">Shop</a></li>
                <li><a href="#videos" className="hover:text-violet-400 transition">Videos</a></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-violet-400 transition">Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-violet-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-violet-400" />
                  <span>hello@fitsphere.com</span>
                </div>
                <div className="flex space-x-4 mt-4">
                  <Instagram className="h-6 w-6 hover:text-pink-400 cursor-pointer transition" />
                  <Facebook className="h-6 w-6 hover:text-blue-400 cursor-pointer transition" />
                  <Twitter className="h-6 w-6 hover:text-blue-300 cursor-pointer transition" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2025 FitSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
