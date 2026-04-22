import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, Bookmark, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ReelsViewer({ videos = [], autoPlay = true }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState({});
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const containerRef = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    // Set up Intersection Observer for auto-play
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.75, // 75% of video must be visible
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        const videoId = entry.target.dataset.videoId;
        const videoElement = videoRefs.current[videoId];

        if (entry.isIntersecting && videoElement) {
          // Play video when it comes into view
          if (autoPlay) {
            videoElement.play().catch(() => {});
            setPlaying(prev => ({ ...prev, [videoId]: true }));
          }
        } else if (videoElement) {
          // Pause video when it leaves view
          videoElement.pause();
          setPlaying(prev => ({ ...prev, [videoId]: false }));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    // Observe all video containers
    const videoContainers = containerRef.current?.querySelectorAll('.reel-item');
    videoContainers?.forEach((container) => observer.observe(container));

    return () => {
      videoContainers?.forEach((container) => observer.unobserve(container));
    };
  }, [videos, autoPlay]);

  const togglePlayPause = (videoId, e) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (playing[videoId]) {
      videoElement.pause();
      setPlaying(prev => ({ ...prev, [videoId]: false }));
    } else {
      videoElement.play().catch(() => {});
      setPlaying(prev => ({ ...prev, [videoId]: true }));
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted(!muted);
    // Apply to all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.muted = !muted;
    });
  };

  const handleLike = (videoId, e) => {
    e.stopPropagation();
    setLiked(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
    toast.success(liked[videoId] ? 'Removed from liked' : 'Added to liked');
  };

  const handleSave = (videoId, e) => {
    e.stopPropagation();
    setSaved(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
    toast.success(saved[videoId] ? 'Removed from saved' : 'Saved for later');
  };

  const handleShare = async (video, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/user/videos/watch/${video.id || video.video_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleVideoClick = (videoId) => {
    // Just toggle play/pause, don't redirect
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (playing[videoId]) {
      videoElement.pause();
      setPlaying(prev => ({ ...prev, [videoId]: false }));
    } else {
      videoElement.play().catch(() => {});
      setPlaying(prev => ({ ...prev, [videoId]: true }));
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        <p>No videos available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="reel-container w-full overflow-y-auto snap-y snap-mandatory"
      style={{ height: 'calc(100vh - 200px)', scrollBehavior: 'smooth' }}
    >
      {videos.map((video, index) => {
        const videoId = video.id || video.video_id || index;
        const isPlaying = playing[videoId];

        return (
          <div
            key={videoId}
            data-video-id={videoId}
            className="reel-item relative w-full snap-start snap-always"
            style={{ height: 'calc(100vh - 200px)' }}
          >
            {/* Video Container */}
            <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden group">
              {/* Video Element */}
              <video
                ref={el => videoRefs.current[videoId] = el}
                src={video.video_url}
                poster={video.thumbnail_url}
                className="w-full h-full object-contain"
                loop
                playsInline
                muted={muted}
                onClick={() => handleVideoClick(videoId)}
                data-testid={`reel-video-${index}`}
              />

              {/* Play/Pause Overlay (shows when paused) */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
                  >
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-10 h-10 text-cyan-600 ml-1" fill="currentColor" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Gradient Overlay */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Video Info (Bottom Left) */}
              <div className="absolute bottom-0 left-0 right-16 p-6 text-white z-10">
                <h3 className="text-xl font-bold mb-2 line-clamp-2" data-testid={`reel-title-${index}`}>
                  {video.title}
                </h3>
                <p className="text-sm text-white/90 mb-3 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-cyan-500/30 rounded-full backdrop-blur-sm">
                    {video.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {Math.floor(video.duration / 60)} min
                  </span>
                  {video.view_count && (
                    <span className="text-white/80">
                      {video.view_count} views
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons (Right Side) */}
              <div className="absolute bottom-0 right-0 p-6 flex flex-col items-center gap-6 z-10">
                {/* Like Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleLike(videoId, e)}
                  className="flex flex-col items-center gap-1"
                  data-testid={`reel-like-btn-${index}`}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Heart 
                      className={`w-6 h-6 ${liked[videoId] ? 'fill-pink-500 text-pink-500' : 'text-white'}`}
                    />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {video.likes || Math.floor(Math.random() * 1000)}
                  </span>
                </motion.button>

                {/* Comment Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(`/user/videos/watch/${videoId}`)}
                  className="flex flex-col items-center gap-1"
                  data-testid={`reel-comment-btn-${index}`}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {video.comments || Math.floor(Math.random() * 100)}
                  </span>
                </motion.button>

                {/* Save Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleSave(videoId, e)}
                  className="flex flex-col items-center gap-1"
                  data-testid={`reel-save-btn-${index}`}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Bookmark 
                      className={`w-6 h-6 ${saved[videoId] ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`}
                    />
                  </div>
                </motion.button>

                {/* Share Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleShare(video, e)}
                  className="flex flex-col items-center gap-1"
                  data-testid={`reel-share-btn-${index}`}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                </motion.button>

                {/* More Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <MoreVertical className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Mute/Unmute Button (Top Right) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                data-testid="reel-mute-btn"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .reel-container::-webkit-scrollbar {
          width: 6px;
        }
        .reel-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .reel-container::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        .reel-container::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
}
