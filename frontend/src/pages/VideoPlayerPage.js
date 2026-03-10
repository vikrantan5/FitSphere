import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Clock, Eye, ArrowLeft, Share2, ThumbsUp, Settings, Loader2 } from 'lucide-react';
import { videoAPI } from '../utils/api';
import { toast } from 'sonner';
import Hls from 'hls.js';

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);

  useEffect(() => {
    if (videoId) {
      loadVideo();
      loadRecommendations();
    }
  }, [videoId]);

  useEffect(() => {
    return () => {
      // Cleanup HLS instance on unmount
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getById(videoId);
      setVideo(response.data);
      
      // Initialize video player after video data is loaded
      setTimeout(() => initializePlayer(response.data), 100);
    } catch (error) {
      toast.error('Failed to load video');
      navigate('/user/videos');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await videoAPI.getAll({ limit: 100 });
      const allVideos = response.data;
      
      // Filter and mix recommendations
      const currentVideo = allVideos.find(v => v.id === videoId);
      if (currentVideo) {
        const sameCategoryVideos = allVideos.filter(
          v => v.id !== videoId && v.category === currentVideo.category
        );
        const sameDifficultyVideos = allVideos.filter(
          v => v.id !== videoId && v.difficulty === currentVideo.difficulty
        );
        const otherVideos = allVideos.filter(
          v => v.id !== videoId && 
          v.category !== currentVideo.category && 
          v.difficulty !== currentVideo.difficulty
        );
        
        // Mix: 3 same category, 3 same difficulty, 2 others
        const mixed = [
          ...sameCategoryVideos.slice(0, 3),
          ...sameDifficultyVideos.slice(0, 3),
          ...otherVideos.slice(0, 2)
        ].slice(0, 8);
        
        setRecommendations(mixed);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const initializePlayer = (videoData) => {
    if (!videoRef.current) return;

    const videoUrl = videoData.video_url;
    
    // Check if it's an HLS stream
    if (videoUrl && videoUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        // Destroy previous instance if exists
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
          // Get available quality levels
          const levels = hls.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate
          }));
          setAvailableQualities(levels);
          videoRef.current.play().catch(e => console.log('Autoplay prevented'));
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
                hls.destroy();
                break;
            }
          }
        });

        // Buffering events
        videoRef.current.addEventListener('waiting', () => setIsBuffering(true));
        videoRef.current.addEventListener('canplay', () => setIsBuffering(false));
        videoRef.current.addEventListener('playing', () => setIsBuffering(false));
        
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
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setQuality(levelIndex === -1 ? 'auto' : `${hlsRef.current.levels[levelIndex].height}p`);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Video link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-xl text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate('/user/videos')} 
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Videos
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl">
              {/* Video Player */}
              <div className="relative bg-black aspect-video">
                {video.embed_url && !video.video_url.includes('.m3u8') ? (
                  <iframe
                    src={video.embed_url}
                    loading="lazy"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    data-testid="video-iframe"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-full"
                      poster={video.thumbnail_url}
                      data-testid="video-player"
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Buffering Overlay */}
                    {isBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-16 w-16 animate-spin text-white" />
                      </div>
                    )}

                    {/* Quality Selector */}
                    {availableQualities.length > 0 && (
                      <div className="absolute bottom-20 right-4 bg-black/80 rounded-lg p-2">
                        <div className="text-white text-sm mb-2 font-semibold">Quality</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`block w-full text-left px-3 py-1 rounded text-sm ${
                              quality === 'auto' ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/20'
                            }`}
                          >
                            Auto
                          </button>
                          {availableQualities.map((level) => (
                            <button
                              key={level.index}
                              onClick={() => changeQuality(level.index)}
                              className={`block w-full text-left px-3 py-1 rounded text-sm ${
                                quality === `${level.height}p` ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/20'
                              }`}
                            >
                              {level.height}p
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold uppercase text-sm">
                    {video.category}
                  </span>
                  <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold capitalize text-sm">
                    {video.difficulty}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(video.duration / 60)} minutes
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Eye className="h-4 w-4 mr-1" />
                    {video.view_count || 0} views
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{video.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button className="flex items-center gap-2" variant="outline">
                    <ThumbsUp className="h-4 w-4" />
                    Like
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Recommended Videos</h2>
              <div className="space-y-4" data-testid="recommendations-list">
                {recommendations.map((recVideo) => (
                  <div
                    key={recVideo.id}
                    onClick={() => navigate(`/user/videos/watch/${recVideo.id}`)}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all group"
                    data-testid="recommendation-item"
                  >
                    <div className="relative w-40 h-24 flex-shrink-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg overflow-hidden">
                      {recVideo.thumbnail_url ? (
                        <img
                          src={recVideo.thumbnail_url}
                          alt={recVideo.title}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="h-8 w-8 text-white/70" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1 py-0.5 rounded text-xs">
                        {Math.floor(recVideo.duration / 60)}m
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {recVideo.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {recVideo.category}
                        </span>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                          {recVideo.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {recVideo.view_count || 0} views
                      </div>
                    </div>
                  </div>
                ))}

                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recommendations available
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
