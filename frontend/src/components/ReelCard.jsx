import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Pause, Eye } from 'lucide-react';

/**
 * ReelCard – individual reel card used inside ReelsCarousel.
 * Prefers Bunny Stream iframe embed when `embed_url` is present (works across
 * all browsers including Chrome, which cannot play HLS .m3u8 natively).
 * Falls back to native <video> for direct mp4/webm URLs.
 *
 * Behavior:
 *  - Initially renders the thumbnail with a big centered "Play" button overlay.
 *  - Clicking the play button loads the Bunny iframe with autoplay=1 inline,
 *    so the video plays *inside* the carousel (no redirect).
 *  - When the user switches reels, playback is reset so only one plays at a time.
 */
const ReelCard = ({
  video,
  position,
  isActive,
  muted,
  liked,
  onToggleLike,
  onToggleMute,
  onClick,
  onHoverChange,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSrc = video.video_url || video.url;
  const embedSrc = video.embed_url;
  const posterSrc = video.thumbnail_url;

  // Prefer the iframe embed whenever we have one. This is the only reliable way
  // to play Bunny Stream HLS (.m3u8) content across all browsers.
const isDirectPlayable = !!videoSrc && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(videoSrc);
  const isEmbed = !!embedSrc && !isDirectPlayable;

  // When this card stops being active, stop playback so only the focused
  // reel has an active video/iframe loaded.
  useEffect(() => {
    if (!isActive) setIsPlaying(false);
  }, [isActive]);

  // Native <video> playback control
  useEffect(() => {
    const el = videoRef.current;
    if (!el || isEmbed) return;
    if (isActive && isPlaying) {
      el.muted = muted;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, isPlaying, muted, isEmbed]);

  const variants = {
    activeSlide: { x: 0, scale: 1.08, opacity: 1, filter: 'blur(0px)', zIndex: 5 },
    prevSlide: { x: -290, scale: 0.82, opacity: 0.55, filter: 'blur(3px)', zIndex: 3 },
    nextSlide: { x: 290, scale: 0.82, opacity: 0.55, filter: 'blur(3px)', zIndex: 3 },
    farPrevSlide: { x: -520, scale: 0.7, opacity: 0.25, filter: 'blur(6px)', zIndex: 1 },
    farNextSlide: { x: 520, scale: 0.7, opacity: 0.25, filter: 'blur(6px)', zIndex: 1 },
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (!isActive) {
      onClick && onClick();
      return;
    }
    setIsPlaying((p) => !p);
  };

  const likes = typeof video.likes === 'number' ? video.likes : (video.view_count || 0);
  const commentCount = video.comment_count || video.comments_count || 0;

  // Build iframe src with the right autoplay param based on play state.
  // Bunny Stream expects boolean strings (true/false), NOT 1/0.
  const buildEmbedSrc = () => {
    const sep = embedSrc.includes('?') ? '&' : '?';
    const params = [
      `autoplay=${isPlaying ? 'true' : 'false'}`,
      `muted=${muted ? 'true' : 'false'}`,
      `loop=true`,
      `preload=true`,
      `responsive=true`,
    ].join('&');
    return `${embedSrc}${sep}${params}`;
  };

  return (
    <motion.div
      className={`reel-card ${position}`}
      variants={variants}
      animate={position}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      onMouseEnter={() => {
        if (isActive && onHoverChange) onHoverChange(true);
      }}
      onMouseLeave={() => onHoverChange && onHoverChange(false)}
      data-testid={`reel-card-${position}`}
    >
      <div className="reel-media">
        {/* Media layer: only mount the actual player once the user hits play,
            and only on the active card. This prevents multiple iframes from
            autoplaying simultaneously and guarantees playback is user-initiated. */}
        {isEmbed ? (
          isActive && isPlaying ? (
            <iframe
              src={buildEmbedSrc()}
              title={video.title}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              className="reel-video"
              data-testid="reel-iframe"
            />
          ) : (
            posterSrc ? (
              <img
                src={posterSrc}
                alt={video.title}
                className="reel-video reel-thumb"
                data-testid="reel-thumbnail"
              />
            ) : (
              <div className="reel-video reel-thumb" />
            )
          )
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
        <div className="reel-gradient" />

        {/* Big centered play overlay while the video is not yet playing */}
        {isActive && !isPlaying && (
          <button
            type="button"
            className="reel-big-play"
            onClick={handlePlayClick}
            aria-label="Play video"
            data-testid="reel-big-play-button"
          >
            <Play className="w-8 h-8" fill="#fff" />
          </button>
        )}
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
            onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
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

          <button
            className="action-btn"
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            data-testid="reel-play-toggle"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            className="action-btn"
            onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
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
