import React, { useEffect, useState, useCallback } from 'react'; // Add useCallback
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Building, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LocationPicker from '@/components/LocationPicker';
import LocationDisplay from '@/components/LocationDisplay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GymSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    gym_name: '',
    gym_location: {
      address: '',
      latitude: 0,
      longitude: 0,
    },
    contact_phone: '',
    contact_email: '',
    operating_hours: '',
  });

  // Wrap loadSettings in useCallback to memoize it
  const loadSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/gym-settings`);
      if (response.data) {
        setSettings(response.data);
        setFormData({
          gym_name: response.data.gym_name,
          gym_location: response.data.gym_location,
          contact_phone: response.data.contact_phone || '',
          contact_email: response.data.contact_email || '',
          operating_hours: response.data.operating_hours || '',
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props/state

  // Fix useEffect by adding navigate to dependency array
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'admin') {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
    loadSettings();
  }, [navigate, loadSettings]); // Add navigate and loadSettings to dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gym_location.address || formData.gym_location.latitude === 0) {
      toast.error('Please provide a valid gym location');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`${API}/gym-settings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Gym settings saved successfully');
      loadSettings();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      gym_location: location,
    });
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="gym-settings-page">
        <div>
          <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>
            Gym Settings
          </h1>
          <p className="text-[#5a5a5a] mt-1">Configure your gym location and contact information</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading settings...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="p-6 bg-white border border-stone-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#0f5132]">
                <Building className="h-5 w-5" />
                Gym Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="gym_name">Gym Name *</Label>
                  <Input
                    id="gym_name"
                    type="text"
                    placeholder="e.g., FitSphere Women's Fitness Center"
                    value={formData.gym_name}
                    onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>

                <LocationPicker
                  label="Gym Location"
                  initialLocation={formData.gym_location.address ? formData.gym_location : null}
                  onLocationChange={handleLocationChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="info@fitsphere.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Textarea
                    id="operating_hours"
                    placeholder="e.g., Mon-Fri: 6:00 AM - 10:00 PM, Sat-Sun: 7:00 AM - 8:00 PM"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#0f5132] to-[#8b5cf6] text-white rounded-full py-6"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Gym Settings'}
                </Button>
              </form>
            </Card>

            {/* Preview */}
            {settings && (
              <Card className="p-6 bg-white border border-stone-100">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#0f5132]">
                  <MapPin className="h-5 w-5" />
                  Current Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{settings.gym_name}</h3>
                  </div>

                  <LocationDisplay
                    location={settings.gym_location}
                    title="Gym Location"
                  />

                  {settings.contact_phone && (
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <p className="text-sm text-gray-700">{settings.contact_phone}</p>
                    </div>
                  )}

                  {settings.contact_email && (
                    <div>
                      <Label className="text-xs">Email</Label>
                      <p className="text-sm text-gray-700">{settings.contact_email}</p>
                    </div>
                  )}

                  {settings.operating_hours && (
                    <div>
                      <Label className="text-xs">Operating Hours</Label>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{settings.operating_hours}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      This location will be used as the default gym location for all programs that support gym attendance.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}