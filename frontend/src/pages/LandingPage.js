import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Play, Star, ArrowRight, CheckCircle, Zap, Users, Trophy, 
  Heart, Dumbbell, TrendingUp, Clock, Mail, Phone, MapPin,
  Instagram, Facebook, Twitter, Youtube, Award, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({ users: 0, videos: 0, workouts: 0 });

  useEffect(() => {
    fetchData();
    animateStats();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, programsRes, productsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/videos/public?limit=6`),
        axios.get(`${API}/programs?limit=4`),
        axios.get(`${API}/products?limit=3`),
        axios.get(`${API}/testimonials?limit=6`)
      ]);
      setVideos(videosRes.data);
      setPrograms(programsRes.data);
      setProducts(productsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const animateStats = () => {
    const duration = 2000;
    const targetStats = { users: 10000, videos: 500, workouts: 50000 };
    const steps = 50;
    const increment = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        users: Math.floor(targetStats.users * progress),
        videos: Math.floor(targetStats.videos * progress),
        workouts: Math.floor(targetStats.workouts * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targetStats);
      }
    }, increment);
  };

  const features = [
    {
      icon: <Dumbbell className="h-8 w-8" />,
      title: "Expert-Led Workouts",
      description: "Access hundreds of professionally designed workout videos for all fitness levels"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Personal Training",
      description: "Book 1-on-1 sessions with certified trainers at the gym or at your home"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Custom Programs",
      description: "Structured fitness programs tailored to your goals and experience level"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Wellness Shop",
      description: "Premium fitness equipment and supplements delivered to your door"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Goal Tracking",
      description: "Monitor your progress and achieve your fitness milestones"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Access",
      description: "Stream workouts anytime, anywhere on any device"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Features</a>
              <a href="#programs" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Programs</a>
              <a href="#videos" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Videos</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Reviews</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/login')}
                className="hidden sm:inline-flex"
              >
                Admin Login
              </Button>
              <Button 
                onClick={() => navigate('/user/dashboard')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6 animate-bounce">
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold">Trusted by 10,000+ Fitness Enthusiasts</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your Body,
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Transform Your Life
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join the ultimate fitness platform with expert-led workouts, personalized training programs, and a supportive community
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg"
                onClick={() => navigate('/user/dashboard')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-6 text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('videos').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-6 text-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.users.toLocaleString()}+
                </div>
                <div className="text-gray-600 mt-2">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {stats.videos}+
                </div>
                <div className="text-gray-600 mt-2">Video Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.workouts.toLocaleString()}+
                </div>
                <div className="text-gray-600 mt-2">Completed Workouts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive fitness solutions designed for your success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 bg-gradient-to-br from-white to-purple-50/30"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center text-white mb-6 transform hover:rotate-6 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Library Preview */}
      <section id="videos" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Video Library</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              500+ professionally filmed workout videos for every fitness level
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {videos.slice(0, 6).map((video) => (
              <Card 
                key={video.id || video.video_id}
                onClick={() => navigate('/user/videos')}
                className="overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-purple-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {video.difficulty}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-purple-600 font-bold mb-2 uppercase tracking-wide">
                    {video.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{Math.floor(video.duration / 60)} minutes</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate('/user/videos')}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-6 text-lg hover:shadow-2xl transition-all"
            >
              Browse All Videos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Structured
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Fitness Programs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow proven programs designed by expert trainers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.slice(0, 4).map((program) => (
              <Card 
                key={program.id}
                className="overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate('/user/dashboard')}
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
                  {program.image_url && (
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 font-bold text-lg">₹{program.price}</span>
                    <span className="text-gray-500 text-sm">{program.duration_weeks} weeks</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Thousands</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community is saying about FitSphere
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic line-clamp-4">"{testimonial.comment}"</p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {testimonial.user_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.user_name}</div>
                    <div className="text-sm text-gray-500 capitalize">{testimonial.service_type}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of members who have transformed their lives with FitSphere
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/user/dashboard')}
            className="bg-white text-purple-600 px-10 py-6 text-lg hover:shadow-2xl transition-all transform hover:scale-105 font-bold"
          >
            Get Started Now - It's Free
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FitSphere</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your complete fitness solution for a healthier, stronger you.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#programs" className="hover:text-purple-400 transition-colors">Programs</a></li>
                <li><a href="#videos" className="hover:text-purple-400 transition-colors">Videos</a></li>
                <li><a href="#testimonials" className="hover:text-purple-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@fitsphere.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 FitSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}