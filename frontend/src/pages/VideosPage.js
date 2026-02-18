import React, { useEffect, useState } from 'react';
import { videoAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Upload, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
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

  const toggleVisibility = async (video) => {
    try {
      await videoAPI.update(video.id, { is_public: !video.is_public });
      toast.success('Visibility updated');
      loadVideos();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="videos-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Videos</h1>
            <p className="text-gray-600 mt-1">Manage workout videos</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            data-testid="upload-video-button"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-all"
          >
            <Upload size={20} />
            Upload Video
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading videos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                data-testid={`video-card-${video.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No thumbnail</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {video.is_public ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Public
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                        Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {video.title}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {video.category}
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {video.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(video)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                      data-testid={`toggle-visibility-${video.id}`}
                    >
                      {video.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
                      {video.is_public ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      data-testid={`delete-video-${video.id}`}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-all"
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
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No videos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  data-testid="video-file-input"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  data-testid="video-title-input"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, category: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
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
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={uploadData.difficulty}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, difficulty: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={uploadData.duration}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, duration: parseInt(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  data-testid="submit-upload"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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
