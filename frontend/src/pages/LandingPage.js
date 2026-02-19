import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Play, Star, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetchPrograms();
    fetchProducts();
    fetchTestimonials();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="landing-page">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-stone-100/50" data-testid="main-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere</h1>
                <p className="text-xs text-[#5a5a5a]">Elevate Your Wellness</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors" data-testid="nav-home">Home</Link>
              <Link to="/programs" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors" data-testid="nav-programs">Programs</Link>
              <Link to="/products" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors" data-testid="nav-products">Shop</Link>
              <Link to="/dashboard" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors" data-testid="nav-dashboard">Dashboard</Link>
            </div>
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white rounded-full px-6 py-3 text-sm uppercase tracking-widest"
              data-testid="nav-login-btn"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599447332128-0b3219997975?auto=format&fit=crop&w=1920&q=80"
            alt="Empowering Fitness"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f5132]/90 to-[#0f5132]/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-block mb-6 px-6 py-3 border border-white/30 rounded-full backdrop-blur-sm">
            <span className="text-sm uppercase tracking-widest">Premium Wellness Experience</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl mb-6 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="hero-title">
            FitSphere
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto" data-testid="hero-subtitle">
            Where Strength Meets Wellness. Personalized fitness. Smart booking. Real-time progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/programs')} 
              className="bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white rounded-full px-10 py-7 text-lg uppercase tracking-widest transition-all hover:scale-105"
              data-testid="hero-book-btn"
            >
              Book Your Session
            </Button>
            <Button 
              onClick={() => navigate('/programs')} 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0f5132] rounded-full px-10 py-7 text-lg uppercase tracking-widest transition-all"
              data-testid="hero-explore-btn"
            >
              Explore Programs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f5132] to-[#0f5132]/95" data-testid="featured-workouts-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="workouts-title">
              Featured Workouts
            </h2>
            <p className="text-white/80 text-base">Discover our most popular training programs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Fat Loss Training', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80', views: '1.2K' },
              { title: 'Strength & Conditioning', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', views: '890' },
              { title: 'Yoga & Flexibility', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', views: '2.1K' },
              { title: 'HIIT Express Workouts', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', views: '1.5K' }
            ].map((workout, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group cursor-pointer" data-testid={`workout-card-${idx}`}>
                <div className="relative aspect-[3/4]">
                  <img src={workout.image} alt={workout.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-lg font-medium mb-2">{workout.title}</h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <Play className="w-4 h-4 mr-1" />
                      <span>{workout.views} views</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white rounded-full px-10 py-6 text-base uppercase tracking-widest" data-testid="view-all-workouts-btn">
              View All Training Videos
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8" data-testid="programs-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0f5132] mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="programs-title">
              Our Signature Programs
            </h2>
            <p className="text-[#5a5a5a] text-base">Tailored fitness programs designed for every goal</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, idx) => (
              <Card key={program.id} className="bg-white border border-stone-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500" data-testid={`program-card-${idx}`}>
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={program.image_url} alt={program.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-4 py-1 bg-[#0f5132] text-white text-xs uppercase tracking-widest rounded-full mb-3">{program.category}</span>
                  <h3 className="text-xl font-medium text-[#1a1a1a] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>{program.name}</h3>
                  <p className="text-[#5a5a5a] text-sm mb-4 line-clamp-2">{program.description}</p>
                  <div className="flex justify-between items-center mb-4 text-sm text-[#5a5a5a]">
                    <span>{program.duration}</span>
                    <span className="font-semibold text-[#0f5132]">₹ {program.price}</span>
                  </div>
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-widest"
                    data-testid={`book-program-btn-${idx}`}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fef3e8] to-[#fef8f2]" data-testid="testimonials-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0f5132] mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="testimonials-title">
              Success Stories
            </h2>
            <p className="text-[#5a5a5a] text-base">Real transformations from real women</p>
          </div>
          {testimonials.length > 0 && (
            <div className="relative">
              <Card className="bg-white border border-stone-100 p-12 rounded-none shadow-lg" data-testid="testimonial-card">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <img
                    src={testimonials[currentTestimonial].image_url}
                    alt={testimonials[currentTestimonial].name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#ff7f50]"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-3">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#8b5cf6] text-[#8b5cf6]" />
                      ))}
                    </div>
                    <p className="text-lg text-[#1a1a1a] mb-4 italic">"{testimonials[currentTestimonial].comment}"</p>
                    <p className="font-medium text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>{testimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-[#5a5a5a]">{new Date(testimonials[currentTestimonial].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </Card>
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full bg-white border-2 border-[#0f5132] flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-all"
                  data-testid="prev-testimonial-btn"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentTestimonial ? 'bg-[#ff7f50] w-8' : 'bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full bg-white border-2 border-[#0f5132] flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-all"
                  data-testid="next-testimonial-btn"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1920&q=80"
            alt="Transformation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f5132]/95 to-[#0f5132]/85"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="cta-title">
            Start Your Fitness Transformation Today
          </h2>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Book sessions, track progress, and achieve your goals with expert guidance
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] hover:opacity-90 text-white rounded-full px-12 py-8 text-lg uppercase tracking-widest transition-all hover:scale-105"
            data-testid="cta-reserve-btn"
          >
            Reserve Your Slot
          </Button>
        </div>
      </section>

      <footer className="bg-[#0f5132] text-white py-16 px-4 sm:px-6 lg:px-8" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl mb-4" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere</h3>
              <p className="text-white/80 text-sm mb-6">
                Empowering women through premium fitness and wellness experiences. Join our community today.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}}>Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/programs" className="text-white/80 hover:text-white transition-colors">Programs</Link></li>
                <li><Link to="/products" className="text-white/80 hover:text-white transition-colors">Shop</Link></li>
                <li><Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/login" className="text-white/80 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}}>Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-white/80">
                  <Phone className="w-4 h-4 mr-2" />
                  +91 98765 43210
                </li>
                <li className="flex items-center text-white/80">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@fitsphere.com
                </li>
                <li className="flex items-center text-white/80">
                  <MapPin className="w-4 h-4 mr-2" />
                  Mumbai, India
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2026 FitSphere. All rights reserved. Crafted with care for women's wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}