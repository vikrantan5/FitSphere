import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dumbbell, Calendar as CalendarIcon, Video, ShoppingBag, MessageCircle, 
  Star, Play, Heart, Send, Package, ClipboardList, TrendingUp, 
  Award, Droplets, Bell, Sparkles, X, Search, Filter, Clock,
  ChevronRight, Plus, Minus, User, Phone, Mail, LogOut
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterIntake, setWaterIntake] = useState(4);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email) {
      navigate('/login');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) return null;

  const stats = {
    sessions: 12,
    calories: 2450,
    activePlan: 'Weight Loss Pro',
    progress: 68
  };

  const trainers = [
    { id: 1, name: 'Sarah Williams', rating: 4.9, specialty: 'Yoga & Meditation', nextSlot: '10:00 AM', price: '₹1,500', image: '👩‍🦰' },
    { id: 2, name: 'Mike Johnson', rating: 4.8, specialty: 'Strength Training', nextSlot: '2:00 PM', price: '₹2,000', image: '👨‍🦱' },
    { id: 3, name: 'Emma Davis', rating: 4.9, specialty: 'HIIT & Cardio', nextSlot: '4:00 PM', price: '₹1,800', image: '👩‍🦱' }
  ];

  const videos = [
    { id: 1, title: 'Morning Yoga Flow', duration: '30 min', category: 'Yoga', thumbnail: '🧘‍♀️' },
    { id: 2, title: 'HIIT Fat Burn', duration: '25 min', category: 'Cardio', thumbnail: '🏃‍♀️' },
    { id: 3, title: 'Core Strength', duration: '20 min', category: 'Strength', thumbnail: '💪' },
    { id: 4, title: 'Pilates Basics', duration: '35 min', category: 'Pilates', thumbnail: '🤸‍♀️' }
  ];

  const products = [
    { id: 1, name: 'Premium Yoga Mat', price: '₹2,499', rating: 4.9, image: '🧘‍♀️', stock: 45 },
    { id: 2, name: 'Resistance Bands Set', price: '₹1,799', rating: 4.8, image: '💪', stock: 32 },
    { id: 3, name: 'Protein Powder 1kg', price: '₹3,499', rating: 4.7, image: '🥤', stock: 120 },
    { id: 4, name: 'Fitness Tracker Watch', price: '₹6,999', rating: 4.9, image: '⌚', stock: 15 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50/30 relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  FitSphere
                </h1>
                <p className="text-xs text-gray-500">Your Wellness Journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              </button>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* 1️⃣ WELCOME HERO SECTION */}
        <div className="mb-8 group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-2xl border-white/20 shadow-2xl hover:shadow-violet-200/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left: Profile & Greeting */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl">
                        {user.name?.charAt(0) || '👤'}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-1">
                      Welcome back, {user.name}! 👋
                    </h2>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <p className="text-sm text-gray-500 italic">"Your fitness journey starts with a single step"</p>
                  </div>
                </div>

                {/* Right: Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                  {[
                    { icon: CalendarIcon, label: 'Sessions', value: stats.sessions, color: 'from-violet-500 to-purple-500' },
                    { icon: TrendingUp, label: 'Calories', value: stats.calories, color: 'from-pink-500 to-rose-500' },
                    { icon: Award, label: 'Active Plan', value: stats.activePlan.split(' ')[0], color: 'from-orange-500 to-amber-500' },
                    { icon: Sparkles, label: 'Progress', value: `${stats.progress}%`, color: 'from-teal-500 to-emerald-500' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:scale-105 transition-transform duration-300 shadow-lg">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="mt-6 flex items-center gap-4">
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="url(#gradient)" 
                      strokeWidth="4" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - stats.progress / 100)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">{stats.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Daily Goal Progress</p>
                  <p className="text-xs text-gray-500">Keep pushing! You're doing great 💪</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 2️⃣ PRIMARY ACTION GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* 🏋️ BOOK SESSION CARD */}
          <Card 
            onClick={() => setShowSessionModal(true)}
            data-testid="book-session-card"
            className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Book Session</h3>
              <p className="text-sm text-gray-600 mb-4">Schedule training with expert coaches</p>
              
              {/* Mini Preview */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white">👩</div>
                  <span className="text-gray-600">3 trainers available</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-600">4.9 avg rating</span>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                Book Now
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* 🎬 WATCH VIDEOS CARD */}
          <Card 
            onClick={() => setShowVideoModal(true)}
            data-testid="watch-videos-card"
            className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Watch Videos</h3>
              <p className="text-sm text-gray-600 mb-4">Access workout library & tutorials</p>
              
              {/* Mini Preview */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['🧘‍♀️', '🏃‍♀️'].map((emoji, idx) => (
                  <div key={idx} className="relative rounded-lg bg-gray-100 aspect-video flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    {emoji}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                Browse Library
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* 🛍 SHOP PRODUCTS CARD */}
          <Card 
            onClick={() => setShowShopModal(true)}
            data-testid="shop-products-card"
            className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Shop Products</h3>
              <p className="text-sm text-gray-600 mb-4">Premium fitness gear & supplements</p>
              
              {/* Mini Preview */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-sm font-bold text-gray-800">₹999</p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg p-2 text-center">
                  <p className="text-xs text-orange-600">Top Rated</p>
                  <p className="text-sm font-bold text-orange-700">4.9★</p>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                Shop Now
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* 💬 LIVE CHAT CARD */}
          <Card 
            onClick={() => setShowChatModal(true)}
            data-testid="live-chat-card"
            className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl hover:shadow-teal-200/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/10 group-hover:to-emerald-500/10 transition-all duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-4">Get instant support from our team</p>
              
              {/* Mini Preview */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-sm">
                      SA
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">Support Agent</p>
                    <p className="text-xs text-gray-500">Online • Avg 2min response</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-600">Hi! How can I help you today?</p>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                Start Chat
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* 3️⃣ SECONDARY CONTENT - TABBED SECTION */}
        <Card className="bg-white/90 backdrop-blur-xl border-white/20 shadow-xl mb-8">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 backdrop-blur-sm">
                <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Package className="w-4 h-4 mr-2" />
                  My Orders
                </TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="membership" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Award className="w-4 h-4 mr-2" />
                  Membership
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-4">Start shopping for premium fitness products</p>
                  <Button onClick={() => setShowShopModal(true)} className="bg-gradient-to-r from-violet-500 to-purple-500">
                    Browse Products
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="mt-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-10 h-10 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-4">Book your first training session today</p>
                  <Button onClick={() => setShowSessionModal(true)} className="bg-gradient-to-r from-pink-500 to-rose-500">
                    Book Session
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Track your progress</h3>
                  <p className="text-gray-500 mb-4">Start your fitness journey to see progress</p>
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                    Start Journey
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="membership" className="mt-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Upgrade Membership</h3>
                  <p className="text-gray-500 mb-4">Get access to premium features</p>
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
                    View Plans
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* 4️⃣ RIGHT SIDEBAR - FLOATING WIDGET */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Water Tracker */}
          <Card className="bg-white/90 backdrop-blur-xl border-white/20 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Water Intake</h3>
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                  className="rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-blue-600">{waterIntake}</p>
                  <p className="text-xs text-gray-500">glasses / 8</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setWaterIntake(Math.min(8, waterIntake + 1))}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(waterIntake / 8) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Workout Reminder */}
          <Card className="bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Daily Reminder</h3>
                  <p className="text-xs text-white/80">Stay consistent</p>
                </div>
              </div>
              <p className="text-sm mb-3">Time for your evening workout! 🎯</p>
              <Button className="w-full bg-white text-violet-600 hover:bg-gray-100">
                Start Workout
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS */}
      {/* Book Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Book Training Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-semibold mb-4">Select Date & Time</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Available Time Slots</p>
                <div className="grid grid-cols-3 gap-2">
                  {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM', '7:00 PM'].map(time => (
                    <Button key={time} variant="outline" size="sm" className="hover:bg-violet-50">
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Choose Trainer</h3>
              <div className="space-y-3">
                {trainers.map(trainer => (
                  <Card key={trainer.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-violet-300">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{trainer.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{trainer.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{trainer.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{trainer.specialty}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Next: {trainer.nextSlot}</span>
                          <span className="font-bold text-violet-600">{trainer.price}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-500">
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Library Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Video Library
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search videos..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['All', 'Yoga', 'Cardio', 'Strength', 'Pilates', 'Beginners'].map(category => (
                <Button key={category} variant="outline" size="sm" className="whitespace-nowrap">
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                            {videos.map(video => (
                <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                  <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-5xl">
                    {video.thumbnail}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-7 h-7 text-pink-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{video.title}</h4>
                    <p className="text-xs text-gray-500">{video.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Modal */}
      <Dialog open={showShopModal} onOpenChange={setShowShopModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Shop Products
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search products..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all">
                  <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-6xl">
                    {product.image}
                    <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1 text-sm">{product.name}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-400 ml-auto">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-600">{product.price}</span>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 h-8">
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl h-[600px] bg-white/95 backdrop-blur-xl flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                  SA
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <DialogTitle className="text-lg">Support Agent</DialogTitle>
                <p className="text-xs text-gray-500">Online • Typically replies in 2 min</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                SA
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-xs">
                <p className="text-sm">Hi! Welcome to FitSphere. How can I help you today? 👋</p>
                <p className="text-xs text-gray-500 mt-1">2:45 PM</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-xs">
                <p className="text-sm">Hi! I'd like to know more about training programs.</p>
                <p className="text-xs text-white/70 mt-1">2:46 PM</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>
          
          <div className="border-t px-6 py-4">
            <div className="flex gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}