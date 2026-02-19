import React, { useEffect, useState } from 'react';
import { videoAPI } from '../lib/api';
import Layout from './Layout';
import { Upload, Trash2, Lock, Unlock, Star, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    category: 'yoga',
    difficulty: 'beginner',
    duration: 0,
    description: '',
    is_free: true
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setVideos(response.data);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('category', uploadData.category);
    formData.append('difficulty', uploadData.difficulty);
    formData.append('duration', uploadData.duration);
    formData.append('description', uploadData.description);
    formData.append('is_free', uploadData.is_free);

    try {
      await videoAPI.upload(formData);
      toast.success('Video uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        file: null,
        title: '',
        category: 'yoga',
        difficulty: 'beginner',
        duration: 0,
        description: '',
        is_free: true
      });
      loadVideos();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await videoAPI.delete(id);
      toast.success('Video deleted successfully');
      loadVideos();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const toggleFreeStatus = async (video) => {
    try {
      await videoAPI.update(video.id, { is_free: !video.is_free });
      toast.success(`Video marked as ${!video.is_free ? 'FREE' : 'PREMIUM'}`);
      loadVideos();
    } catch (error) {
      toast.error('Failed to update video status');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="videos-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Videos</h1>
            <p className="text-[#5a5a5a] mt-1">Manage workout videos and access control</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            data-testid="upload-video-button"
            className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-all uppercase tracking-wider text-sm font-semibold shadow-lg"
          >
            <Upload size={20} />
            Upload Video
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading videos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                data-testid={`video-card-${video.id}`}
                className="bg-white rounded-none shadow-md overflow-hidden hover:shadow-xl transition-all border border-stone-100"
              >
                <div className="aspect-video bg-gradient-to-br from-[#0f5132] to-[#0a3d25] relative">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white/50">No thumbnail</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {video.is_free ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        <Unlock className="w-3 h-3" />
                        FREE
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        <Star className="w-3 h-3" />
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    {video.is_public ? (
                      <span className="bg-white/90 text-[#0f5132] px-2 py-1 rounded-full text-xs font-semibold">
                        Visible
                      </span>
                    ) : (
                      <span className="bg-gray-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {video.title}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-[#0f5132] text-white px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                      {video.category}
                    </span>
                    <span className="text-xs bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                      {video.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="text-xs text-[#5a5a5a] mb-4">
                    ⏱ {Math.floor(video.duration / 60)} min • {video.view_count || 0} views
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFreeStatus(video)}
                      className={`flex-1 px-3 py-2 rounded-full transition-all flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                        video.is_free 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      data-testid={`toggle-free-status-${video.id}`}
                    >
                      {video.is_free ? (
                        <>
                          <Lock size={14} />
                          Make Premium
                        </>
                      ) : (
                        <>
                          <Unlock size={14} />
                          Make Free
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      data-testid={`delete-video-${video.id}`}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all"
                      title="Delete video"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-none border border-stone-100">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#5a5a5a] opacity-50" />
            <p className="text-[#5a5a5a]">No videos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-stone-200">
            <h2 className="text-2xl font-normal text-[#0f5132] mb-6" style={{fontFamily: 'Tenor Sans, serif'}}>Upload Video</h2>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  data-testid="video-file-input"
                  className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  data-testid="video-title-input"
                  className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">Category *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, category: e.target.value })
                    }
                    className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  >
                    <option value="yoga">Yoga</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="pilates">Pilates</option>
                    <option value="dance">Dance</option>
                    <option value="meditation">Meditation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">Difficulty *</label>
                  <select
                    value={uploadData.difficulty}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, difficulty: e.target.value })
                    }
                    className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  value={uploadData.duration}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, duration: parseInt(e.target.value) })
                  }
                  className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm uppercase tracking-wider text-[#5a5a5a] mb-2 font-semibold">Description *</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                  required
                />
              </div>
              
              {/* Free/Premium Toggle */}
              <div className="bg-[#fef3e8] p-4 border border-stone-200 rounded-none">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadData.is_free}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, is_free: e.target.checked })
                    }
                    data-testid="video-is-free-checkbox"
                    className="w-5 h-5 text-[#0f5132] border-stone-300 rounded focus:ring-[#0f5132] focus:ring-2 mr-3"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider">
                      {uploadData.is_free ? '🔓 FREE Video' : '🔒 PREMIUM Video'}
                    </span>
                    <p className="text-xs text-[#5a5a5a] mt-1">
                      {uploadData.is_free 
                        ? 'This video will be visible to all visitors on the homepage' 
                        : 'Only logged-in users can access this video'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  data-testid="submit-upload"
                  className="flex-1 bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white py-3 rounded-full hover:opacity-90 disabled:opacity-50 uppercase tracking-wider font-semibold transition-all"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-stone-200 text-[#5a5a5a] py-3 rounded-full hover:bg-stone-300 uppercase tracking-wider font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}