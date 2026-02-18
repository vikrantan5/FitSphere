import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Clock, Eye, Dumbbell, X, Search } from 'lucide-react';
import { videoAPI } from '../utils/api';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, categoryFilter, difficultyFilter]);

  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getAll({ limit: 100 });
      setVideos(response.data);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(video => video.category === categoryFilter);
    }

    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter(video => video.difficulty === difficultyFilter);
    }

    setFilteredVideos(filtered);
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const categories = ['all', 'yoga', 'cardio', 'strength', 'pilates', 'dance', 'meditation'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Dumbbell className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <Button onClick={() => navigate('/user/dashboard')} variant="outline">Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Workout Video Library
          </h1>
          <p className="text-xl text-gray-600">
            Expert-led tutorials for all fitness levels
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger data-testid="difficulty-filter">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(diff => (
                  <SelectItem key={diff} value={diff}>
                    {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">Loading videos...</div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">No videos found</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="videos-grid">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                onClick={() => openVideo(video)}
                className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
                data-testid="video-card"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center group">
                  <Play className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(video.duration / 60)} min
                  </div>
                  <div className="absolute bottom-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
                    {video.difficulty}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-purple-600 font-semibold mb-2 uppercase">
                    {video.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{video.view_count || 0} views</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div>
              <div className="aspect-video bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-4">
                {selectedVideo.video_url ? (
                  <video controls className="w-full h-full rounded-lg" data-testid="video-player">
                    <source src={selectedVideo.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Play className="h-24 w-24 text-white" />
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold uppercase">
                    {selectedVideo.category}
                  </span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold capitalize">
                    {selectedVideo.difficulty}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(selectedVideo.duration / 60)} minutes
                  </span>
                </div>
                <p className="text-gray-700">{selectedVideo.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
