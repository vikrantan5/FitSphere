import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Pause, Eye } from 'lucide-react';

/**
 * ReelCard – individual reel card used inside ReelsCarousel.
 * Automatically renders <video> for direct URLs or <iframe> for embed URLs (YouTube/Vimeo/Bunny).
 */
const ReelCard = ({
  video,
  position,
  isActive,
  muted,
  pausedByHover,
  liked,
  onToggleLike,
  onToggleMute,
  onHoverChange,
  onClick,
}) => {
  const videoRef = useRef(null);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const videoSrc = video.video_url || video.url;
  const embedSrc = video.embed_url;
  const posterSrc = video.thumbnail_url;
  // FIXED: Invalid regex pattern - changed (?|$) to (\?|$)
  const isEmbed = !!embedSrc && !videoSrc?.match(/\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i);

  // Play/pause logic for native <video>
  useEffect(() => {
    const el = videoRef.current;
    if (!el || isEmbed) return;
    if (isActive && !manuallyPaused && !isHovering) {
      el.muted = muted;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, manuallyPaused, isHovering, muted, isEmbed]);

  // Variant animation for each position
  const variants = {
    activeSlide: {
      x: 0,
      scale: 1.08,
      opacity: 1,
      filter: 'blur(0px)',
      zIndex: 5,
    },
    prevSlide: {
      x: -290,
      scale: 0.82,
      opacity: 0.55,
      filter: 'blur(3px)',
      zIndex: 3,
    },
    nextSlide: {
      x: 290,
      scale: 0.82,
      opacity: 0.55,
      filter: 'blur(3px)',
      zIndex: 3,
    },
    farPrevSlide: {
      x: -520,
      scale: 0.7,
      opacity: 0.25,
      filter: 'blur(6px)',
      zIndex: 1,
    },
    farNextSlide: {
      x: 520,
      scale: 0.7,
      opacity: 0.25,
      filter: 'blur(6px)',
      zIndex: 1,
    },
  };

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (isEmbed) return;
    if (manuallyPaused) {
      setManuallyPaused(false);
    } else {
      const el = videoRef.current;
      if (el && !el.paused) el.pause();
      setManuallyPaused(true);
    }
  };

  const likes = typeof video.likes === 'number' ? video.likes : (video.view_count || 0);
  const commentCount = video.comment_count || video.comments_count || 0;

  return (
    <motion.div
      className={`reel-card ${position}`}
      variants={variants}
      animate={position}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      onMouseEnter={() => {
        if (isActive) {
          setIsHovering(true);
          onHoverChange && onHoverChange(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        onHoverChange && onHoverChange(false);
      }}
      data-testid={`reel-card-${position}`}
    >
      <div className="reel-media">
        {isEmbed ? (
          <iframe
            src={`${embedSrc}${embedSrc.includes('?') ? '&' : '?'}autoplay=${
              isActive && !isHovering ? 1 : 0
            }&muted=${muted ? 1 : 0}&loop=1&preload=true`}
            title={video.title}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            frameBorder="0"
            className="reel-video"
            data-testid="reel-iframe"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            className="reel-video"
            data-testid="reel-video"
          />
        )}
        {posterSrc && !isActive && (
          <img
            src={posterSrc}
            alt={video.title}
            className="reel-poster"
            aria-hidden
          />
        )}
        <div className="reel-gradient" />
      </div>

      <div className="reel-overlay">
        <div className="reel-top">
          <span className="reel-chip">
            {video.category || video.difficulty || 'Training'}
          </span>
          {typeof video.view_count === 'number' && (
            <span className="reel-views">
              <Eye className="w-3.5 h-3.5" />
              {video.view_count}
            </span>
          )}
        </div>

        <div className="reel-bottom">
          <h3 className="reel-title" data-testid="reel-title">{video.title}</h3>
          {video.description && (
            <p className="reel-desc">{video.description}</p>
          )}
        </div>
      </div>

      {isActive && (
        <div className="reel-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`action-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            aria-label="Like"
            data-testid="reel-like-button"
          >
            <Heart className="w-5 h-5" fill={liked ? '#ef4444' : 'none'} />
            <span>{likes + (liked ? 1 : 0)}</span>
          </button>

          <button
            className="action-btn"
            aria-label="Comments"
            data-testid="reel-comment-button"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{commentCount}</span>
          </button>

          {!isEmbed && (
            <button
              className="action-btn"
              onClick={handlePlayToggle}
              aria-label={manuallyPaused ? 'Play' : 'Pause'}
              data-testid="reel-play-toggle"
            >
              {manuallyPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            data-testid="reel-mute-button"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ReelCard;