import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Plus, Edit, Trash2, X, Dumbbell, DollarSign, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration_weeks: '',
    price: '',
    difficulty: 'beginner',
    trainer_id: '',
    image_url: '',
    sessions_per_week: 3,
    video_ids: [],
    supports_gym_attendance: true,
    supports_home_visit: false,
    home_visit_additional_charge: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'admin') {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
    loadPrograms();
    loadTrainers();
  }, []);

  const loadPrograms = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/programs`, {
        params: { limit: 100 }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Load programs error:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => {
    try {
      const response = await axios.get(`${API}/trainers`, {
        params: { limit: 100 }
      });
      setTrainers(response.data);
    } catch (error) {
      console.error('Load trainers error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Validate at least one attendance option
    if (!formData.supports_gym_attendance && !formData.supports_home_visit) {
      toast.error('Please select at least one attendance option (Gym or Home Visit)');
      return;
    }
    
    // Validate image URL if provided (allow both http and https, or empty)
    if (formData.image_url && formData.image_url.trim() !== '' && !isValidImageUrl(formData.image_url)) {
      toast.error('Please enter a valid image URL (must start with http:// or https://)');
      return;
    }

    try {
      const payload = {
        ...formData,
        image_url: formData.image_url.trim() || undefined, // Send undefined if empty
        duration_weeks: parseInt(formData.duration_weeks),
        price: parseFloat(formData.price),
        sessions_per_week: parseInt(formData.sessions_per_week),
        home_visit_additional_charge: parseFloat(formData.home_visit_additional_charge) || 0
      };

      if (editingProgram) {
        await axios.put(`${API}/programs/${editingProgram.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Program updated successfully');
      } else {
        await axios.post(`${API}/programs`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Program created successfully');
      }
      
      resetForm();
      loadPrograms();
      setShowModal(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const isValidImageUrl = (url) => {
    // Allow both http:// and https://
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      category: program.category,
      duration_weeks: program.duration_weeks,
      price: program.price,
      difficulty: program.difficulty,
      trainer_id: program.trainer_id,
      image_url: program.image_url || '',
      sessions_per_week: program.sessions_per_week || 3,
      video_ids: program.video_ids || [],
      supports_gym_attendance: program.supports_gym_attendance !== undefined ? program.supports_gym_attendance : true,
      supports_home_visit: program.supports_home_visit || false,
      home_visit_additional_charge: program.home_visit_additional_charge || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Program deleted successfully');
      loadPrograms();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete program');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      duration_weeks: '',
      price: '',
      difficulty: 'beginner',
      trainer_id: '',
      image_url: '',
      sessions_per_week: 3,
      video_ids: [],
      supports_gym_attendance: true,
      supports_home_visit: false,
      home_visit_additional_charge: 0
    });
    setEditingProgram(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="programs-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Programs</h1>
            <p className="text-[#5a5a5a] mt-1">Manage fitness programs and training plans</p>
          </div>
          <Button
            onClick={handleOpenModal}
            data-testid="create-program-button"
            className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-all uppercase tracking-wider text-sm font-semibold shadow-lg"
          >
            <Plus size={20} />
            Create Program
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading programs...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, idx) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-xl transition-all bg-white border border-stone-100" data-testid={`program-card-${idx}`}>
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#0f5132] to-[#0a3d25]">
                  {program.image_url ? (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f5132] to-[#0a3d25] flex items-center justify-center" style={{ display: program.image_url ? 'none' : 'flex' }}>
                    <Dumbbell className="h-20 w-20 text-white opacity-50" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#0f5132]">
                    {program.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] px-3 py-1 rounded-full text-xs font-bold text-white">
                    {program.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800" data-testid={`program-title-${idx}`}>{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-[#5a5a5a]">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span>{program.duration_weeks} weeks • {program.sessions_per_week}x/week</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span className="font-bold text-[#ff7f50]" data-testid={`program-price-${idx}`}>₹{program.price}</span>
                      {program.supports_home_visit && program.home_visit_additional_charge > 0 && (
                        <span className="ml-2 text-xs text-[#8b5cf6]">(+₹{program.home_visit_additional_charge} for home)</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-[#0f5132]" />
                      <span>{program.enrolled_count || 0} enrolled</span>
                    </div>
                    
                    {/* Attendance Mode Badges */}
                    <div className="flex gap-2 pt-2">
                      {program.supports_gym_attendance && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          🏋️ Gym
                        </span>
                      )}
                      {program.supports_home_visit && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🏠 Home Visit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(program)}
                      data-testid={`edit-program-${idx}`}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#0f5132] text-[#0f5132] hover:bg-[#0f5132] hover:text-white rounded-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(program.id)}
                      data-testid={`delete-program-${idx}`}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {programs.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-none border border-stone-100">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-[#5a5a5a] opacity-50" />
            <p className="text-[#5a5a5a]">No programs found. Create your first program!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>
                {editingProgram ? 'Edit Program' : 'Create New Program'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#5a5a5a] hover:text-[#1a1a1a]">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Program Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Beginner Strength Training"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                  required
                  data-testid="program-title-input"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the program..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2 min-h-[100px]"
                  required
                  data-testid="program-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Category *</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g., Strength Training"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                    required
                    data-testid="program-category-input"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Difficulty *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger className="mt-2 rounded-none border-stone-300" data-testid="program-difficulty-select">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration_weeks" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Duration (weeks) *</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    placeholder="8"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                    className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                    required
                    data-testid="program-duration-input"
                  />
                </div>

                <div>
                  <Label htmlFor="sessions_per_week" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Sessions/Week *</Label>
                  <Input
                    id="sessions_per_week"
                    type="number"
                    min="1"
                    max="7"
                    placeholder="3"
                    value={formData.sessions_per_week}
                    onChange={(e) => setFormData({ ...formData, sessions_per_week: e.target.value })}
                    className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                    required
                    data-testid="program-sessions-input"
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="2999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                    required
                    data-testid="program-price-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="trainer_id" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Trainer *</Label>
                <Select value={formData.trainer_id} onValueChange={(value) => setFormData({ ...formData, trainer_id: value })}>
                  <SelectTrigger className="mt-2 rounded-none border-stone-300" data-testid="program-trainer-select">
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {trainers.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">No trainers found. Please create a trainer first.</p>
                )}
              </div>

              {/* Attendance Mode Options */}
              <div className="border border-stone-200 p-4 rounded-lg bg-gray-50">
                <Label className="text-sm uppercase tracking-wider text-[#5a5a5a] mb-3 block">Attendance Options</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="supports_gym_attendance"
                      checked={formData.supports_gym_attendance}
                      onChange={(e) => setFormData({ ...formData, supports_gym_attendance: e.target.checked })}
                      className="h-4 w-4 text-[#0f5132] border-stone-300 rounded focus:ring-[#0f5132]"
                      data-testid="gym-attendance-checkbox"
                    />
                    <label htmlFor="supports_gym_attendance" className="ml-2 text-sm text-gray-700">
                      🏋️ Supports Gym Attendance
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="supports_home_visit"
                      checked={formData.supports_home_visit}
                      onChange={(e) => setFormData({ ...formData, supports_home_visit: e.target.checked })}
                      className="h-4 w-4 text-[#8b5cf6] border-stone-300 rounded focus:ring-[#8b5cf6]"
                      data-testid="home-visit-checkbox"
                    />
                    <label htmlFor="supports_home_visit" className="ml-2 text-sm text-gray-700">
                      🏠 Supports Home Visits
                    </label>
                  </div>

                  {formData.supports_home_visit && (
                    <div className="ml-6 mt-2">
                      <Label htmlFor="home_visit_additional_charge" className="text-xs text-gray-600">
                        Additional Charge for Home Visits (₹)
                      </Label>
                      <Input
                        id="home_visit_additional_charge"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="500"
                        value={formData.home_visit_additional_charge}
                        onChange={(e) => setFormData({ ...formData, home_visit_additional_charge: parseFloat(e.target.value) || 0 })}
                        className="bg-white border border-stone-300 rounded-none px-3 py-2 focus:border-[#8b5cf6] focus:ring-0 mt-1"
                        data-testid="home-visit-charge-input"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This amount will be added to the base price for home visit bookings
                      </p>
                    </div>
                  )}

                  {!formData.supports_gym_attendance && !formData.supports_home_visit && (
                    <p className="text-xs text-red-500 mt-2">⚠️ At least one attendance option must be selected</p>
                  )}
                </div>
              </div>

              {/* Image URL Input */}
              <div>
                <Label htmlFor="image_url" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  type="text"
                  placeholder="https://example.com/image.jpg or http://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-transparent border border-stone-300 rounded-none px-4 py-3 focus:border-[#0f5132] focus:ring-0 mt-2"
                  data-testid="program-image-url-input"
                />
                <p className="text-xs text-[#5a5a5a] mt-2">
                  💡 Tip: Right-click on any Google Image → "Copy image address" and paste here (supports both http:// and https://)
                </p>
                {formData.image_url && formData.image_url.trim() !== '' && (
                  <div className="mt-3">
                    <p className="text-xs text-[#5a5a5a] mb-2">Preview:</p>
                    <div className="w-full h-40 border border-stone-300 rounded-none overflow-hidden bg-[#fdfbf7]">
                      <img 
                        src={formData.image_url} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '';
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-red-500 text-sm" style={{ display: 'none' }}>
                        Invalid or broken image URL
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1 border-stone-300 text-[#5a5a5a] hover:bg-stone-100 rounded-full py-6 uppercase tracking-wider"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-wider font-semibold"
                  data-testid="submit-program-button"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}