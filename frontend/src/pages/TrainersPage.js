import React, { useEffect, useState } from 'react';
import { trainerAPI, imageAPI } from '../utils/api';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, UserCircle, Mail, Phone, Award, Briefcase, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: 0,
    bio: '',
    image_url: '',
    certifications: [],
    is_active: true
  });
  const [certificationInput, setCertificationInput] = useState('');

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const response = await trainerAPI.getAll({ limit: 100 });
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to load trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        experience_years: trainer.experience_years,
        bio: trainer.bio,
        image_url: trainer.image_url || '',
        certifications: trainer.certifications || [],
        is_active: trainer.is_active
      });
    } else {
      setEditingTrainer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience_years: 0,
        bio: '',
        image_url: '',
        certifications: [],
        is_active: true
      });
    }
    setCertificationInput('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
    setCertificationInput('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCertification = () => {
    if (certificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }));
      setCertificationInput('');
    }
  };

  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', `Trainer ${formData.name || 'Image'}`);
      uploadFormData.append('image_type', 'trainer');

      const response = await imageAPI.upload(uploadFormData);
      
      setFormData(prev => ({
        ...prev,
        image_url: response.data.image_url
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0
      };

      if (editingTrainer) {
        await trainerAPI.update(editingTrainer.id, payload);
        toast.success('Trainer updated successfully');
      } else {
        await trainerAPI.create(payload);
        toast.success('Trainer added successfully');
      }

      handleCloseModal();
      loadTrainers();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save trainer');
    }
  };

  const handleDelete = async (trainerId, trainerName) => {
    if (!window.confirm(`Are you sure you want to delete trainer "${trainerName}"?`)) {
      return;
    }

    try {
      await trainerAPI.delete(trainerId);
      toast.success('Trainer deleted successfully');
      loadTrainers();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete trainer');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="trainers-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Trainer Management</h1>
            <p className="text-gray-600 mt-1">Manage your fitness trainers</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            data-testid="add-trainer-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading trainers...</div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-gray-600">Total Trainers</p>
                <p className="text-3xl font-bold text-gray-800">{trainers.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600">Active Trainers</p>
                <p className="text-3xl font-bold text-green-600">
                  {trainers.filter(t => t.is_active).length}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600">Inactive Trainers</p>
                <p className="text-3xl font-bold text-red-600">
                  {trainers.filter(t => !t.is_active).length}
                </p>
              </Card>
            </div>

            {/* Trainers Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full" data-testid="trainers-table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trainers.map((trainer) => (
                    <tr key={trainer.id} data-testid={`trainer-row-${trainer.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {trainer.image_url ? (
                            <img
                              src={trainer.image_url}
                              alt={trainer.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <UserCircle className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{trainer.name}</p>
                            <p className="text-sm text-gray-500">
                              {trainer.certifications?.length || 0} certifications
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {trainer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {trainer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          <Award className="w-4 h-4" />
                          {trainer.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-gray-700">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {trainer.experience_years} years
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            trainer.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {trainer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(trainer)}
                            data-testid={`edit-trainer-${trainer.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(trainer.id, trainer.name)}
                            data-testid={`delete-trainer-${trainer.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trainers.length === 0 && (
                <div className="text-center py-12">
                  <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No trainers found</p>
                  <Button
                    onClick={() => handleOpenModal()}
                    className="mt-4"
                  >
                    Add Your First Trainer
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Profile Image</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Trainer"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-white" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB, JPG or PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter trainer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="trainer@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Yoga, Strength Training"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">Experience (Years) *</Label>
                <Input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, is_active: value === 'active' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Brief description about the trainer..."
                rows={4}
              />
            </div>

            {/* Certifications */}
            <div>
              <Label>Certifications</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  placeholder="Add certification"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCertification();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCertification}
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
