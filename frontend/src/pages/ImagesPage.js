import React, { useEffect, useState } from 'react';
import { imageAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    image_type: 'banner',
    description: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await imageAPI.getAll();
      setImages(response.data);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('image_type', uploadData.image_type);
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }

    try {
      await imageAPI.upload(formData);
      toast.success('Image uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        file: null,
        title: '',
        image_type: 'banner',
        description: '',
      });
      loadImages();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await imageAPI.delete(id);
      toast.success('Image deleted successfully');
      loadImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="images-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Images</h1>
            <p className="text-gray-600 mt-1">Manage website images and media</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            data-testid="upload-image-button"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-all"
          >
            <Upload size={20} />
            Upload Image
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading images...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                data-testid={`image-card-${image.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{image.title}</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {image.image_type}
                  </span>
                  <button
                    onClick={() => handleDelete(image.id)}
                    data-testid={`delete-image-${image.id}`}
                    className="mt-3 w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No images uploaded yet</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Image</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  data-testid="image-file-input"
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
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image Type</label>
                <select
                  value={uploadData.image_type}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, image_type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="banner">Banner</option>
                  <option value="trainer">Trainer</option>
                  <option value="gallery">Gallery</option>
                  <option value="program">Program</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
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
