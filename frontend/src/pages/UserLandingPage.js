import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Heart, Star, Sparkles, Phone, Mail, Instagram, Youtube } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserLandingPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, programsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/videos`, { params: { limit: 4 } }),
        axios.get(`${API}/programs`, { params: { limit: 8 } }),
        axios.get(`${API}/testimonials`, { params: { limit: 6, approved_only: true } })
      ]);
      
      setVideos(videosRes.data);
      setPrograms(programsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f3] to-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#0f5132]" style={{fontFamily: 'Playfair Display, serif'}}>
                  Henna Heaven
                </span>
                <p className="text-xs text-gray-600">Luxury Mehendi Art</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-[#0f5132] hover:text-[#ff7f50] font-medium transition">
                Home
              </a>
              <a href="#designs" className="text-[#0f5132] hover:text-[#ff7f50] font-medium transition">
                Designs
              </a>
              <a href="#moments" className="text-[#0f5132] hover:text-[#ff7f50] font-medium transition">
                Messages
              </a>
              <a href="#admin" className="text-[#0f5132] hover:text-[#ff7f50] font-medium transition" onClick={() => navigate('/login')}>
                Admin
              </a>
              <a href="#testimonials" className="text-[#0f5132] hover:text-[#ff7f50] font-medium transition">
                Logout
              </a>
            </div>

            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full px-8"
            >
              Book Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1600')",
            filter: 'blur(2px)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f5132]/80 via-[#0f5132]/60 to-transparent"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-2 bg-white/20 backdrop-blur-md rounded-full mb-8 border border-white/30">
              <Sparkles className="h-4 w-4 text-[#d4af37] mr-2" />
              <span className="text-white font-medium tracking-wide">Premium Mehendi Experience</span>
            </div>
            
            <h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white drop-shadow-2xl"
              style={{fontFamily: 'Playfair Display, serif'}}
            >
              Henna Heaven
            </h1>
            
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Where tradition meets luxury. Creating unforgettable mehendi moments for your special day.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white text-lg px-10 py-7 rounded-full shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Book Your Mehendi Experience
              </Button>
              
              <Button 
                onClick={() => document.getElementById('designs').scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 rounded-full border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Browse Designs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mehendi Moments (Videos) */}
      {videos.length > 0 && (
        <section id="moments" className="py-20 bg-gradient-to-br from-[#0f5132] to-[#0f5132]/90">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 
                className="text-5xl font-bold mb-4 text-white"
                style={{fontFamily: 'Playfair Display, serif'}}
              >
                Mehendi Moments
              </h2>
              <p className="text-xl text-white/80">Watch our latest creations come to life</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.slice(0, 4).map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-white/95 backdrop-blur rounded-2xl"
                  onClick={() => navigate('/user/videos')}
                >
                  <div className="relative h-72 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] flex items-center justify-center group">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-20 w-20 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-[#ff7f50] mr-2" />
                        <span className="text-sm font-semibold text-[#0f5132]">{video.view_count || 1250}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-[#0f5132]">{video.title}</h3>
                    <p className="text-gray-600 text-sm">{video.description?.substring(0, 60)}...</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/user/videos')}
                className="bg-white text-[#0f5132] hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold"
              >
                View All Reels
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Our Signature Collection (Programs) */}
      {programs.length > 0 && (
        <section id="designs" className="py-20 bg-gradient-to-br from-[#fdf8f3] to-[#fff5ee]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 
                className="text-5xl font-bold mb-4 text-[#0f5132]"
                style={{fontFamily: 'Playfair Display, serif'}}
              >
                Our Signature Collection
              </h2>
              <p className="text-xl text-gray-700">Handpicked designs for every occasion</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {programs.slice(0, 8).map((program) => (
                <Card 
                  key={program.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 bg-white rounded-2xl group"
                >
                  <div className="relative h-80 overflow-hidden">
                    {program.image_url ? (
                      <img 
                        src={program.image_url} 
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ff7f50] to-[#d4af37] flex items-center justify-center">
                        <Sparkles className="h-20 w-20 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#0f5132] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {program.category || 'Bridal'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-[#0f5132]" style={{fontFamily: 'Playfair Display, serif'}}>
                      {program.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Starting from</div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#ff7f50] to-[#d4af37] bg-clip-text text-transparent">
                          ₹{program.price}
                        </span>
                      </div>
                      <Button 
                        onClick={handleGetStarted}
                        className="bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full"
                      >
                        Book Now
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏱</span>
                      <span>{program.duration_weeks ? `${program.duration_weeks} hours` : '3 hours'}</span>
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
        <section id="testimonials" className="py-20 bg-gradient-to-br from-[#ffe5e0] via-[#fff5ee] to-[#fde8d0]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 
                className="text-5xl font-bold mb-4 text-[#0f5132]"
                style={{fontFamily: 'Playfair Display, serif'}}
              >
                What Our Brides Say
              </h2>
              <p className="text-xl text-gray-700">Real stories from real celebrations</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {testimonials[currentTestimonial] && (
                <Card className="p-12 bg-white/80 backdrop-blur shadow-2xl rounded-3xl">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-8 w-8 text-[#d4af37] fill-[#d4af37]" />
                    ))}
                  </div>
                  <p className="text-2xl text-gray-800 text-center mb-8 italic leading-relaxed">
                    "{testimonials[currentTestimonial].comment}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff7f50] to-[#d4af37] flex items-center justify-center text-white font-bold text-2xl">
                      {testimonials[currentTestimonial].user_name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-xl text-[#0f5132]">
                        {testimonials[currentTestimonial].user_name}
                      </div>
                      <div className="text-gray-600">
                        {new Date(testimonials[currentTestimonial].created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-[#0f5132] hover:bg-[#0f5132] hover:text-white"
                >
                  ←
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className={`h-3 rounded-full transition-all ${
                        idx === currentTestimonial 
                          ? 'w-8 bg-[#ff7f50]' 
                          : 'w-3 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-[#0f5132] hover:bg-[#0f5132] hover:text-white"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f5132] to-[#0f5132]/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#d4af37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ff7f50] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <Sparkles className="h-16 w-16 text-[#d4af37] mx-auto mb-6" />
          <h2 
            className="text-5xl font-bold mb-6 text-white"
            style={{fontFamily: 'Playfair Display, serif'}}
          >
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Book your mehendi experience today and let us make your special day even more beautiful
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white text-lg px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            Book Your Slot Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a3d2e] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-2xl font-bold" style={{fontFamily: 'Playfair Display, serif'}}>
                  Henna Heaven
                </span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Creating unforgettable mehendi moments with luxury, tradition, and artistry.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <div className="space-y-3 text-white/70">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-[#ff7f50]" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-[#ff7f50]" />
                  <span>hello@hennaheaven.com</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60">
            <p className="flex items-center justify-center gap-2">
              © 2026 Henna Heaven. All rights reserved. Made with love and mehendi. 
              <Heart className="h-4 w-4 text-[#ff7f50]" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
