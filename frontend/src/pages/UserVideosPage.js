import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Clock, Eye, Dumbbell, X, Search, Filter, 
  ChevronDown, Heart, Share2, Bookmark, ThumbsUp,
  Sparkles, TrendingUp, Star, Award, Zap, Layers,
  Grid, List, Video, Calendar, Users, Activity,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX,
  Settings, Download, AlertCircle, CheckCircle
} from 'lucide-react';
import { videoAPI } from '../utils/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function UserVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalWatchTime: 0,
    completedVideos: 0,
    favoritesCount: 0
  });

  useEffect(() => {
    fetchVideos();
    loadUserPreferences();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, categoryFilter, difficultyFilter, sortBy]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getAll({ limit: 100 });
      setVideos(response.data);
      setStats(prev => ({ ...prev, totalVideos: response.data.length }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('videoFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load watch history
    const history = localStorage.getItem('watchHistory');
    if (history) {
      setWatchHistory(JSON.parse(history));
    }
  };

  const filterVideos = useCallback(() => {
    let filtered = [...videos];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(video => video.category === categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter(video => video.difficulty === difficultyFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'duration_asc':
        filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case 'duration_desc':
        filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      default:
        break;
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, categoryFilter, difficultyFilter, sortBy]);

  const openVideo = (video) => {
    const targetVideoId = video?.id || video?.video_id;
    if (!targetVideoId) {
      toast.error('Video is not available right now');
      return;
    }
    
    // Add to watch history
    const history = [...watchHistory, { ...video, watchedAt: new Date().toISOString() }];
    setWatchHistory(history);
    localStorage.setItem('watchHistory', JSON.stringify(history.slice(-50))); // Keep last 50
    
    navigate(`/user/videos/watch/${targetVideoId}`);
  };

  const toggleFavorite = (video, e) => {
    e.stopPropagation();
    const videoId = video.id || video.video_id;
    const newFavorites = favorites.includes(videoId)
      ? favorites.filter(id => id !== videoId)
      : [...favorites, videoId];
    
    setFavorites(newFavorites);
    localStorage.setItem('videoFavorites', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(videoId) ? 'Removed from favorites' : 'Added to favorites',
      { duration: 2000 }
    );
  };

  const shareVideo = async (video, e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.origin + `/user/videos/watch/${video.id || video.video_id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/user/videos/watch/${video.id || video.video_id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const categories = useMemo(() => 
    ['all', 'yoga', 'cardio', 'strength', 'pilates', 'dance', 'meditation', 'hiit', 'stretching'],
    []
  );

  const difficulties = useMemo(() => 
    ['all', 'beginner', 'intermediate', 'advanced', 'expert'],
    []
  );

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FitSphere
                </h1>
                <p className="text-xs text-zinc-400">Video Library</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigate('/user/dashboard')}
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header with Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Premium Fitness Library
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Workout Video
            </span>
            <br />
            <span className="text-white">Library</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
            Expert-led tutorials for all fitness levels with real-time progress tracking
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
            {[
              { label: 'Total Videos', value: stats.totalVideos, icon: Video },
              { label: 'Watch Time', value: `${stats.totalWatchTime}h`, icon: Clock },
              { label: 'Completed', value: stats.completedVideos, icon: CheckCircle },
              { label: 'Favorites', value: favorites.length, icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Card className="bg-zinc-900/90 border border-white/10 backdrop-blur-xl mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Filter Videos</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-400'}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-400'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-white/10 bg-zinc-950/70 pl-9 text-zinc-100 placeholder:text-zinc-500"
                    data-testid="search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-white/10 bg-zinc-950/70 text-zinc-100" data-testid="category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-100">
                    {categories.map((cat) => (
                      <SelectItem 
                        key={cat} 
                        value={cat}
                        className="hover:bg-white/10 focus:bg-white/10"
                        data-testid={`videos-category-${cat}`}
                      >
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="border-white/10 bg-zinc-950/70 text-zinc-100" data-testid="difficulty-filter">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-100">
                    {difficulties.map((diff) => (
                      <SelectItem 
                        key={diff} 
                        value={diff}
                        className="hover:bg-white/10 focus:bg-white/10"
                        data-testid={`videos-difficulty-${diff}`}
                      >
                        {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-white/10 bg-zinc-950/70 text-zinc-100">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-100">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="duration_asc">Shortest First</SelectItem>
                    <SelectItem value="duration_desc">Longest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <span className="text-sm text-zinc-400 mr-2">Active filters:</span>
                  {searchQuery && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      Search: {searchQuery}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Category: {categoryFilter}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
                    </Badge>
                  )}
                  {difficultyFilter !== 'all' && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Difficulty: {difficultyFilter}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setDifficultyFilter('all')} />
                    </Badge>
                  )}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          variants={fadeInUp}
          className="mb-4 flex justify-between items-center"
        >
          <p className="text-zinc-400">
            Showing <span className="text-white font-semibold">{filteredVideos.length}</span> videos
          </p>
          <p className="text-sm text-zinc-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Videos Grid/List */}
        {loading ? (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
            data-testid="videos-loading"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5"
              >
                <Skeleton className="aspect-video w-full bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20 bg-zinc-800" />
                  <Skeleton className="h-6 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-zinc-800" />
                    <Skeleton className="h-4 w-16 bg-zinc-800" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/20"
          >
            <Video className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your filters or search query</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setDifficultyFilter('all');
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
            data-testid="videos-grid"
          >
            <AnimatePresence>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id || video.video_id}
                  variants={fadeInUp}
                  layout
                  whileHover={{ y: -5 }}
                  className={`group cursor-pointer ${
                    viewMode === 'list' ? 'col-span-1' : ''
                  }`}
                  onClick={() => openVideo(video)}
                >
                  <Card 
                    className={`overflow-hidden border border-white/10 bg-zinc-900/70 hover:bg-zinc-900/90 transition-all ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    data-testid={`video-card-${video.id || video.video_id || 'unknown'}`}
                  >
                    {/* Thumbnail */}
                    <div className={`relative ${
                      viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'
                    } overflow-hidden bg-zinc-950`}>
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          data-testid={`video-thumb-${video.id || video.video_id || 'unknown'}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Video className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor((video.duration || 0) / 60)} min
                      </div>

                      {/* Difficulty Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={`
                          ${video.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            video.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            video.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                            'bg-red-500/20 text-red-300 border-red-500/30'}
                        `}>
                          {video.difficulty}
                        </Badge>
                      </div>

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => toggleFavorite(video, e)}
                        className="absolute top-2 left-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.includes(video.id || video.video_id)
                              ? 'fill-pink-500 text-pink-500'
                              : 'text-white'
                          }`}
                        />
                      </motion.button>

                      {/* Share Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => shareVideo(video, e)}
                        className="absolute top-2 right-12 p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </motion.button>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-4 flex-1 ${
                      viewMode === 'list' ? 'flex flex-col justify-between' : ''
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                            {video.category}
                          </Badge>
                          <div className="flex items-center text-sm text-zinc-400">
                            <Eye className="h-3 w-3 mr-1" />
                            {video.view_count || 0}
                          </div>
                        </div>

                        <h3 className="font-semibold text-white mb-2 line-clamp-2" 
                            data-testid={`video-title-${video.id || video.video_id || 'unknown'}`}>
                          {video.title}
                        </h3>

                        <p className="text-sm text-zinc-400 mb-3 line-clamp-2"
                           data-testid={`video-description-${video.id || video.video_id || 'unknown'}`}>
                          {video.description}
                        </p>

                        {/* Progress Bar for watched videos */}
                        {watchHistory.some(w => w.id === video.id || w.video_id === video.video_id) && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-zinc-500 mb-1">
                              <span>Progress</span>
                              <span>45%</span>
                            </div>
                            <Progress value={45} className="h-1" />
                          </div>
                        )}

                        {/* Trainer Info */}
                        {video.trainer && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-cyan-500 to-purple-500">
                                {video.trainer.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-zinc-400">{video.trainer}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {video.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-full text-zinc-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More Button */}
        {filteredVideos.length > 0 && filteredVideos.length < videos.length && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => toast.info('Loading more videos...')}
            >
              Load More Videos
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl bg-zinc-950 border border-white/10 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white">
                {selectedVideo?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedVideo && (
            <div className="p-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 group">
                {selectedVideo.embed_url ? (
                  <iframe
                    src={selectedVideo.embed_url}
                    loading="lazy"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    className="rounded-xl"
                    data-testid="video-player"
                  />
                ) : selectedVideo.video_url && selectedVideo.video_url.includes('.m3u8') ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20">
                    <div className="text-center">
                      <Play className="h-24 w-24 text-white/50 mx-auto mb-4" />
                      <p className="text-white">Video playback unavailable</p>
                    </div>
                  </div>
                ) : selectedVideo.video_url ? (
                  <>
                    <video controls className="w-full h-full rounded-xl" data-testid="video-player">
                      <source src={selectedVideo.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                          <Play className="h-4 w-4 text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                          {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                          <Settings className="h-4 w-4 text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                          <Maximize2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
                    <Play className="h-24 w-24 text-white" />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                    {selectedVideo.category}
                  </Badge>
                  <Badge className={`
                    ${selectedVideo.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      selectedVideo.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      selectedVideo.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      'bg-red-500/20 text-red-300 border-red-500/30'}
                    px-3 py-1
                  `}>
                    {selectedVideo.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-zinc-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor((selectedVideo.duration || 0) / 60)} minutes
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-zinc-300">
                    <Eye className="h-3 w-3 mr-1" />
                    {selectedVideo.view_count || 0} views
                  </Badge>
                </div>

                <p className="text-zinc-300 leading-relaxed">
                  {selectedVideo.description}
                </p>

                {/* Trainer Info */}
                {selectedVideo.trainer && (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                        {selectedVideo.trainer.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-zinc-400">Trainer</p>
                      <p className="font-semibold text-white">{selectedVideo.trainer}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    onClick={() => {
                      setIsModalOpen(false);
                      openVideo(selectedVideo);
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Full Screen
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={(e) => toggleFavorite(selectedVideo, e)}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${
                      favorites.includes(selectedVideo.id || selectedVideo.video_id)
                        ? 'fill-pink-500 text-pink-500'
                        : ''
                    }`} />
                    {favorites.includes(selectedVideo.id || selectedVideo.video_id) ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={(e) => shareVideo(selectedVideo, e)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                {/* Recommended Videos */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                    Recommended for you
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {videos.slice(0, 4).map((recVideo) => (
                      <motion.div
                        key={recVideo.id}
                        whileHover={{ scale: 1.05 }}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedVideo(recVideo);
                        }}
                      >
                        <Card className="border border-white/10 bg-zinc-900/70 overflow-hidden">
                          <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 relative">
                            {recVideo.thumbnail_url && (
                              <img
                                src={recVideo.thumbnail_url}
                                alt={recVideo.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-white line-clamp-1">{recVideo.title}</p>
                            <p className="text-xs text-zinc-400">{Math.floor((recVideo.duration || 0) / 60)} min</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}