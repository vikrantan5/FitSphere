import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Clock, Eye, ArrowLeft, Share2, ThumbsUp, Settings, Loader2,
  Volume2, VolumeX, Maximize2, Minimize2, Download, Heart, Bookmark,
  ChevronDown, ChevronUp, Star, Award, TrendingUp, Users, Sparkles,
  AlertCircle, CheckCircle, X, PlayCircle, PauseCircle
} from 'lucide-react';
import { videoAPI } from '../utils/api';
import { toast } from 'sonner';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [stats, setStats] = useState({
    likes: 0,
    saves: 0,
    shares: 0,
    completions: 0
  });

  useEffect(() => {
    if (videoId && videoId !== 'undefined' && videoId !== 'null') {
      loadVideo();
      loadRecommendations();
      loadComments();
    } else {
      toast.error('Invalid video ID');
      navigate('/user/videos');
    }

    // Load user preferences
    const savedNotes = localStorage.getItem(`video-notes-${videoId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      // Save watch progress
      if (currentTime > 0 && video) {
        saveWatchProgress();
      }
    };
  }, [videoId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setCurrentTime(videoRef.current.currentTime);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Hide controls after inactivity
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      
      const videoFetcher = videoAPI.getById || videoAPI.getOne;
      if (!videoFetcher) {
        throw new Error('Video API method not available');
      }

      const response = await videoFetcher(videoId);
      setVideo(response.data);
      
      // Increment view count
      await videoAPI.incrementViews?.(videoId);
      
      // Initialize player after video data is loaded
      setTimeout(() => initializePlayer(response.data), 100);
      
      // Load video stats
      loadVideoStats(videoId);
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video', {
        description: 'Please try again later'
      });
      navigate('/user/videos');
    } finally {
      setLoading(false);
    }
  };

  const loadVideoStats = async (id) => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        likes: Math.floor(Math.random() * 1000),
        saves: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 300),
        completions: Math.floor(Math.random() * 200)
      });
    } catch (error) {
      console.error('Error loading video stats:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await videoAPI.getAll({ limit: 100 });
      const allVideos = response.data || [];
      
      // Filter out current video and get recommendations
      const otherVideos = allVideos.filter(v => v.id !== videoId && v.video_id !== videoId);
      
      // Shuffle and take first 8
      const shuffled = otherVideos.sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 8));
      
      // Also set related videos (same category)
      if (video) {
        const sameCategory = otherVideos.filter(v => v.category === video.category);
        setRelatedVideos(sameCategory.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadComments = async () => {
    try {
      // Mock comments - replace with actual API call
      setComments([
        {
          id: 1,
          user: 'Sarah Johnson',
          avatar: null,
          comment: 'This workout completely transformed my core strength!',
          timestamp: '2 days ago',
          likes: 24,
          replies: 3
        },
        {
          id: 2,
          user: 'Emily Chen',
          avatar: null,
          comment: 'Great explanation of form. Really helped me avoid injury.',
          timestamp: '5 days ago',
          likes: 18,
          replies: 2
        },
        {
          id: 3,
          user: 'Maria Garcia',
          avatar: null,
          comment: 'Challenging but so rewarding! Can\'t wait for the next one.',
          timestamp: '1 week ago',
          likes: 15,
          replies: 1
        }
      ]);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const initializePlayer = (videoData) => {
    if (!videoRef.current) return;

    const videoUrl = videoData.video_url;
    
    // Set up event listeners
    videoRef.current.addEventListener('timeupdate', updateProgress);
    videoRef.current.addEventListener('loadedmetadata', () => {
      setDuration(videoRef.current.duration);
    });
    videoRef.current.addEventListener('play', () => setIsPlaying(true));
    videoRef.current.addEventListener('pause', () => setIsPlaying(false));
    videoRef.current.addEventListener('waiting', () => setIsBuffering(true));
    videoRef.current.addEventListener('canplay', () => setIsBuffering(false));
    videoRef.current.addEventListener('playing', () => setIsBuffering(false));
    videoRef.current.addEventListener('volumechange', () => {
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.volume);
    });
    
    // Check if it's an HLS stream
    if (videoUrl && videoUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate,
            name: `${level.height}p`
          }));
          setAvailableQualities(levels);
          
          // Try to autoplay
          videoRef.current.play().catch(() => {
            console.log('Autoplay prevented');
          });
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const level = hls.levels[data.level];
          if (level) {
            setQuality(`${level.height}p`);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, cannot recover');
                toast.error('Video playback error');
                hls.destroy();
                break;
            }
          }
        });
        
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = videoUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play().catch(e => console.log('Autoplay prevented'));
        });
      }
    } else if (videoUrl) {
      // Regular MP4 video
      videoRef.current.src = videoUrl;
    }

    // Load saved progress
    const savedTime = localStorage.getItem(`video-progress-${videoId}`);
    if (savedTime) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  };

  const updateProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const saveWatchProgress = () => {
    if (currentTime > 30) { // Save if watched more than 30 seconds
      localStorage.setItem(`video-progress-${videoId}`, currentTime.toString());
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setQuality(levelIndex === -1 ? 'auto' : `${hlsRef.current.levels[levelIndex].height}p`);
      setShowQualityMenu(false);
      toast.success(`Quality changed to ${quality}`);
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: url
        });
        setStats(prev => ({ ...prev, shares: prev.shares + 1 }));
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Video link copied to clipboard!');
      setStats(prev => ({ ...prev, shares: prev.shares + 1 }));
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setStats(prev => ({ 
      ...prev, 
      likes: isLiked ? prev.likes - 1 : prev.likes + 1 
    }));
    toast.success(isLiked ? 'Removed like' : 'Added to liked videos');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setStats(prev => ({ 
      ...prev, 
      saves: isSaved ? prev.saves - 1 : prev.saves + 1 
    }));
    
    // Save to localStorage
    const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '[]');
    if (!isSaved) {
      savedVideos.push(videoId);
    } else {
      const index = savedVideos.indexOf(videoId);
      if (index > -1) savedVideos.splice(index, 1);
    }
    localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
    
    toast.success(isSaved ? 'Removed from saved' : 'Video saved for later');
  };

  const handleDownload = () => {
    if (video.video_url) {
      const a = document.createElement('a');
      a.href = video.video_url;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    }
  };

  const saveNotes = () => {
    localStorage.setItem(`video-notes-${videoId}`, notes);
    toast.success('Notes saved');
    setShowNotes(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-zinc-300"
          >
            Loading your workout...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!video) return null;

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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/user/videos')}
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
            </motion.div>

            <div className="flex items-center gap-3">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Content
              </Badge>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Video Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Badge className="mb-3 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Award className="w-3 h-3 mr-1" />
            Featured Workout
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {video.title}
          </h1>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>with {video.trainer || 'Expert Trainer'}</span>
            <span className="w-1 h-1 bg-zinc-600 rounded-full" />
            <span>{video.difficulty} level</span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                ref={containerRef}
                className="relative overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl"
              >
                {/* Video Player Container */}
                <div 
                  className="relative aspect-video bg-black group"
                  onMouseMove={() => setShowControls(true)}
                  onMouseLeave={() => isPlaying && setShowControls(false)}
                >
                  {video.embed_url ? (
                    <iframe
                      src={video.embed_url}
                      loading="lazy"
                      style={{ border: 'none', width: '100%', height: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                      className="w-full h-full"
                      data-testid="video-iframe"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        poster={video.thumbnail_url}
                        onClick={togglePlay}
                        data-testid="video-player"
                      />

                      {/* Video Controls Overlay */}
                      <AnimatePresence>
                        {showControls && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
                          >
                            {/* Top Controls */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                              <Badge className="bg-black/50 backdrop-blur-sm border-white/20">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </Badge>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="bg-black/50 hover:bg-black/70 text-white"
                                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="bg-black/50 hover:bg-black/70 text-white"
                                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                >
                                  <span className="text-xs font-bold">{playbackSpeed}x</span>
                                </Button>
                              </div>
                            </div>

                            {/* Center Play/Pause Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50"
                              >
                                {isPlaying ? (
                                  <PauseCircle className="h-10 w-10 text-white" />
                                ) : (
                                  <Play className="h-10 w-10 text-white ml-1" />
                                )}
                              </motion.button>
                            </div>

                            {/* Bottom Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              {/* Progress Bar */}
                              <div 
                                className="relative h-2 bg-white/20 rounded-full mb-4 cursor-pointer group"
                                onClick={handleSeek}
                              >
                                <div 
                                  className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                                <div 
                                  className="absolute w-4 h-4 bg-white rounded-full -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ left: `calc(${progress}% - 8px)` }}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={togglePlay}
                                  >
                                    {isPlaying ? (
                                      <PauseCircle className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                  
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={toggleMute}
                                  >
                                    {isMuted ? (
                                      <VolumeX className="h-4 w-4" />
                                    ) : (
                                      <Volume2 className="h-4 w-4" />
                                    )}
                                  </Button>

                                  <div className="text-sm text-white">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={toggleFullscreen}
                                  >
                                    {isFullscreen ? (
                                      <Minimize2 className="h-4 w-4" />
                                    ) : (
                                      <Maximize2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Quality Menu */}
                            <AnimatePresence>
                              {showQualityMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bottom-20 right-4 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-2 w-40"
                                >
                                  <p className="text-xs font-semibold text-zinc-400 mb-2 px-2">Quality</p>
                                  <button
                                    onClick={() => changeQuality(-1)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      quality === 'auto' 
                                        ? 'bg-cyan-500 text-white' 
                                        : 'text-zinc-300 hover:bg-white/10'
                                    }`}
                                  >
                                    Auto
                                  </button>
                                  {availableQualities.map((level) => (
                                    <button
                                      key={level.index}
                                      onClick={() => changeQuality(level.index)}
                                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        quality === level.name
                                          ? 'bg-cyan-500 text-white'
                                          : 'text-zinc-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {level.height}p
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Speed Menu */}
                            <AnimatePresence>
                              {showSpeedMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bottom-20 right-24 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-2 w-32"
                                >
                                  <p className="text-xs font-semibold text-zinc-400 mb-2 px-2">Speed</p>
                                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => changePlaybackSpeed(speed)}
                                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        playbackSpeed === speed
                                          ? 'bg-cyan-500 text-white'
                                          : 'text-zinc-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Buffering Overlay */}
                      <AnimatePresence>
                        {isBuffering && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60"
                          >
                            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>

                {/* Video Info Section */}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                      {video.category}
                    </Badge>
                    <Badge className={`
                      ${video.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        video.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-orange-500/20 text-orange-300 border-orange-500/30'}
                      px-3 py-1
                    `}>
                      {video.difficulty}
                    </Badge>
                    <span className="flex items-center text-zinc-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.floor(video.duration / 60)} min
                    </span>
                    <span className="flex items-center text-zinc-400 text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      {video.view_count || 0} views
                    </span>
                  </div>

                  <p className="text-zinc-300 leading-relaxed mb-6">
                    {video.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className={`border-white/10 hover:bg-white/10 ${
                        isLiked ? 'bg-pink-500/20 text-pink-300' : 'text-zinc-300'
                      }`}
                      onClick={handleLike}
                    >
                      <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'fill-pink-300' : ''}`} />
                      {stats.likes} Likes
                    </Button>
                    
                    <Button
                      variant="outline"
                      className={`border-white/10 hover:bg-white/10 ${
                        isSaved ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-300'
                      }`}
                      onClick={handleSave}
                    >
                      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-cyan-300' : ''}`} />
                      {stats.saves} Saved
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-white/10 text-zinc-300 hover:bg-white/10"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>

                    <Button
                      variant="outline"
                      className="border-white/10 text-zinc-300 hover:bg-white/10"
                      onClick={() => setShowNotes(!showNotes)}
                    >
                      {showNotes ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                      Notes
                    </Button>
                  </div>

                  {/* Notes Section */}
                  <AnimatePresence>
                    {showNotes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Take notes while watching..."
                          className="w-full h-32 bg-zinc-800 border border-white/10 rounded-lg p-3 text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowNotes(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-cyan-500 text-white"
                            onClick={saveNotes}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Card className="bg-zinc-900/90 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Users className="mr-2 h-5 w-5 text-cyan-400" />
                    Comments ({comments.length})
                  </h3>
                  <Badge className="bg-white/5 text-zinc-300">Join the conversation</Badge>
                </div>

                {/* Add Comment */}
                <div className="flex gap-3 mb-6">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="ghost" className="text-zinc-400">
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-cyan-500 text-white">
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xs">
                          {comment.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{comment.user}</span>
                          <span className="text-xs text-zinc-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">{comment.comment}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-cyan-400">
                            <ThumbsUp className="h-3 w-3" />
                            {comment.likes}
                          </button>
                          <button className="text-xs text-zinc-500 hover:text-cyan-400">
                            Reply
                          </button>
                          {comment.replies > 0 && (
                            <button className="text-xs text-cyan-400">
                              View {comment.replies} replies
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-zinc-900/90 border border-white/10 sticky top-24">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                    Recommended
                  </h2>
                </div>

                <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <Tabs defaultValue="all" className="mb-4">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                      <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500">All</TabsTrigger>
                      <TabsTrigger value="related" className="data-[state=active]:bg-cyan-500">Related</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-3 mt-4">
                      {recommendations.map((recVideo, index) => (
                        <motion.div
                          key={recVideo.id || recVideo.video_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            onClick={() => navigate(`/user/videos/watch/${recVideo.id || recVideo.video_id}`)}
                            className="w-full group"
                          >
                            <div className="flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                              <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                {recVideo.thumbnail_url ? (
                                  <img
                                    src={recVideo.thumbnail_url}
                                    alt={recVideo.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="h-5 w-5 text-zinc-500" />
                                  </div>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                  {Math.floor(recVideo.duration / 60)}m
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                  {recVideo.title}
                                </h3>
                                <div className="flex items-center gap-1 mt-1">
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] px-1.5 py-0">
                                    {recVideo.difficulty}
                                  </Badge>
                                  <span className="text-xs text-zinc-500">
                                    {recVideo.view_count || 0} views
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}

                      {recommendations.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-zinc-500">No recommendations available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="related" className="space-y-3 mt-4">
                      {relatedVideos.map((recVideo, index) => (
                        <motion.div
                          key={recVideo.id || recVideo.video_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            onClick={() => navigate(`/user/videos/watch/${recVideo.id || recVideo.video_id}`)}
                            className="w-full group"
                          >
                            <div className="flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                              <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                {recVideo.thumbnail_url && (
                                  <img
                                    src={recVideo.thumbnail_url}
                                    alt={recVideo.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-sm font-medium text-zinc-100 line-clamp-2">
                                  {recVideo.title}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {recVideo.category}
                                </p>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Video Stats */}
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-3">Video Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-zinc-500">Likes</p>
                      <p className="text-lg font-bold text-cyan-400">{stats.likes}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-zinc-500">Saves</p>
                      <p className="text-lg font-bold text-blue-400">{stats.saves}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-zinc-500">Shares</p>
                      <p className="text-lg font-bold text-purple-400">{stats.shares}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-zinc-500">Completed</p>
                      <p className="text-lg font-bold text-green-400">{stats.completions}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}