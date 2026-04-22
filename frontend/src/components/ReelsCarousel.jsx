import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import ReelCard from './ReelCard';
import './reels.css';

/**
 * ReelsCarousel – NamasteDev-style trending reels carousel
 * Props:
 *  - videos: array of { id, title, description, video_url, embed_url, thumbnail_url, view_count, likes }
 */
const ReelsCarousel = ({ videos = [] }) => {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState({});
  const [isPausedByHover, setIsPausedByHover] = useState(false);

  const total = videos.length;

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'm' || e.key === 'M') setMuted((m) => !m);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prevSlide, nextSlide]);

  const toggleLike = (videoId) => {
    setLikes((prev) => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  if (!videos || total === 0) {
    return (
      <div className="reels-empty" data-testid="reels-empty-state">
        <p>No trending reels available yet. Check back soon!</p>
      </div>
    );
  }

  const getPosition = (index) => {
    if (index === current) return 'activeSlide';
    if (index === (current - 1 + total) % total) return 'prevSlide';
    if (index === (current + 1) % total) return 'nextSlide';
    if (index === (current - 2 + total) % total) return 'farPrevSlide';
    if (index === (current + 2) % total) return 'farNextSlide';
    return 'hiddenSlide';
  };

  return (
    <div className="carousel-container" data-testid="reels-carousel">
      <div className="carousel-heading">
        <div className="heading-badge">
          <Flame className="w-4 h-4" />
          <span>Trending Now</span>
        </div>
        <h2 className="carousel-title" data-testid="reels-carousel-title">
          Trending Reels
        </h2>
        <p className="carousel-subtitle">
          Real transformations. Real stories. Tap, swipe, get inspired.
        </p>
      </div>

      <div
        className="carousel"
        data-testid="reels-carousel-stage"
        // drag="x"
        // dragConstraints={{ left: 0, right: 0 }}
      >
        <motion.div
          className="carousel-inner"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (offset.x < -100 || swipe < -1000) nextSlide();
            else if (offset.x > 100 || swipe > 1000) prevSlide();
          }}
        >
          <AnimatePresence initial={false}>
            {videos.map((video, index) => {
              const position = getPosition(index);
              if (position === 'hiddenSlide') return null;
              const key = video.id || video._id || video.video_id || index;
              return (
                <ReelCard
                  key={key}
                  video={video}
                  position={position}
                  isActive={index === current}
                  muted={muted}
                  pausedByHover={isPausedByHover}
                  liked={!!likes[key]}
                  onToggleLike={() => toggleLike(key)}
                  onToggleMute={() => setMuted((m) => !m)}
                  onHoverChange={setIsPausedByHover}
                  onClick={() => {
                    if (index !== current) {
                      setCurrent(index);
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="arrows">
        <button
          onClick={prevSlide}
          aria-label="Previous reel"
          data-testid="reels-prev-button"
          className="arrow-btn"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="reel-indicator" data-testid="reels-indicator">
          <span className="current">{String(current + 1).padStart(2, '0')}</span>
          <span className="divider">/</span>
          <span className="total">{String(total).padStart(2, '0')}</span>
        </div>
        <button
          onClick={nextSlide}
          aria-label="Next reel"
          data-testid="reels-next-button"
          className="arrow-btn"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="dots" data-testid="reels-dots">
        {videos.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to reel ${i + 1}`}
            data-testid={`reels-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelsCarousel;
