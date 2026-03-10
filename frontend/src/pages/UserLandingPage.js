import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Dumbbell, ShoppingBag, Calendar, PlayCircle, 
  Star, TrendingUp, Award, Zap, Users, ChevronRight,
  Shield, Target, Activity, Heart
} from 'lucide-react';
import { UserLayout } from '@/components/user/UserLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function UserLanding() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalUsers: '10K+',
    programsCompleted: '50K+',
    successRate: '95%',
    trainers: '50+'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, videosRes] = await Promise.all([
        axios.get(`${API}/programs`, { params: { limit: 4 } }),
        axios.get(`${API}/videos/public`, { params: { limit: 4 } })
      ]);
      
      setPrograms(programsRes.data.slice(0, 4));
      setVideos(videosRes.data.slice(0, 4));
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
    } else {
      navigate('/login');
    }
  };

  return (
    <UserLayout
      activePath="/user/landing"
      hidePageHeader={true}
      pageWrapperClassName="min-h-screen"
    >
      {/* Hero Section */}
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-900/90 border border-white/10 backdrop-blur-xl mb-8 p-12"
        data-testid="hero-section"
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Transform Your Fitness Journey</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              data-testid="hero-title"
            >
              Welcome to FitSphere
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto"
              data-testid="hero-subtitle"
            >
              Your ultimate fitness companion. Book sessions, shop premium gear, and access exclusive training programs.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 px-8 py-6 text-lg rounded-full"
                data-testid="get-started-btn"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              <Button
                onClick={() => navigate('/user/sessions')}
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                data-testid="explore-programs-btn"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Explore Programs
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        data-testid="stats-section"
      >
        {[
          { label: 'Active Users', value: stats.totalUsers, icon: Users, color: 'cyan' },
          { label: 'Programs Completed', value: stats.programsCompleted, icon: Activity, color: 'purple' },
          { label: 'Success Rate', value: stats.successRate, icon: TrendingUp, color: 'emerald' },
          { label: 'Expert Trainers', value: stats.trainers, icon: Award, color: 'amber' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-white/10 backdrop-blur-xl p-6">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${stat.color}-500/10 to-transparent rounded-full blur-2xl`} />
              <div className="relative z-10">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mb-12"
        data-testid="features-section"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">Why Choose FitSphere?</h2>
          <p className="text-zinc-400 text-lg">Everything you need for your fitness journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Calendar,
              title: 'Book Sessions',
              description: 'Schedule personal training sessions with certified trainers',
              color: 'cyan',
              path: '/user/sessions'
            },
            {
              icon: ShoppingBag,
              title: 'Shop Gear',
              description: 'Premium equipment and supplements curated for you',
              color: 'blue',
              path: '/user/shop'
            },
            {
              icon: PlayCircle,
              title: 'Training Videos',
              description: 'Access exclusive workout videos and programs',
              color: 'purple',
              path: '/user/videos'
            },
            {
              icon: Target,
              title: 'Track Progress',
              description: 'Monitor your fitness journey and achievements',
              color: 'emerald',
              path: '/user/dashboard'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
                onClick={() => navigate(feature.path)}
                data-testid={`feature-card-${index}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative p-6">
                  <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{feature.description}</p>
                  <div className={`flex items-center text-${feature.color}-400 group-hover:gap-2 transition-all`}>
                    <span className="text-sm font-medium">Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Programs Preview */}
      {programs.length > 0 && (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12"
          data-testid="programs-section"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Programs</h2>
              <p className="text-zinc-400">Start your transformation today</p>
            </div>
            <Button
              onClick={() => navigate('/user/sessions')}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              View All Programs
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/20 transition-all" data-testid={`program-card-${index}`}>
                  <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                    {program.image_url && (
                      <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{program.title}</h3>
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-cyan-400">₹{program.price}</span>
                      <Button
                        size="sm"
                        onClick={() => navigate('/user/sessions')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Videos Preview */}
      {videos.length > 0 && (
        <motion.section
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12"
          data-testid="videos-section"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Training Videos</h2>
              <p className="text-zinc-400">Free workout content to get you started</p>
            </div>
            <Button
              onClick={() => navigate('/user/videos')}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              View All Videos
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer" onClick={() => navigate('/user/videos')} data-testid={`video-card-${index}`}>
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    {video.thumbnail_url && (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{video.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">{video.difficulty}</span>
                      <span>{video.duration} min</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 p-12 text-center"
        data-testid="cta-section"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm">
            <Star className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Join Thousands of Happy Members</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your fitness journey today with personalized training, expert guidance, and premium equipment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              className="bg-white text-cyan-600 hover:bg-white/90 px-8 py-6 text-lg rounded-full font-semibold"
              data-testid="cta-start-btn"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button
              onClick={() => navigate('/user/shop')}
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full backdrop-blur-sm"
              data-testid="cta-shop-btn"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Gear
            </Button>
          </div>
        </div>
      </motion.section>
    </UserLayout>
  );
}
