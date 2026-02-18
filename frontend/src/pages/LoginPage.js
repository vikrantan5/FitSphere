import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  
  // Member login state
  const [memberLoginData, setMemberLoginData] = useState({ email: '', password: '' });
  
  // Member signup state
  const [memberSignupData, setMemberSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    phone: '' 
  });
  
  // Admin login state
  const [adminLoginData, setAdminLoginData] = useState({ email: '', password: '' });
  
  const [loading, setLoading] = useState(false);

  const handleMemberLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/user/login`, memberLoginData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userRole', 'user');
      toast.success('Welcome back!');
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, memberSignupData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userRole', 'user');
      toast.success('Account created successfully!');
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, adminLoginData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userRole', 'admin');
      toast.success('Welcome Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f5132] to-[#0f5132]/90 flex items-center justify-center p-4" data-testid="login-page">
      <Card className="w-full max-w-md bg-white rounded-none border-0 shadow-2xl" data-testid="login-card">
        <div className="bg-gradient-to-r from-[#0f5132] to-[#0f5132]/95 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">F</span>
          </div>
          <h1 className="text-3xl text-white mb-2" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="login-title">FitSphere</h1>
          <p className="text-white/80 text-sm">Elevate Your Wellness Journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-8" data-testid="login-tabs">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-stone-100 rounded-full p-1">
            <TabsTrigger 
              value="member" 
              className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7f50] data-[state=active]:to-[#d4af37] data-[state=active]:text-white"
              data-testid="member-tab"
            >
              Member
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="rounded-full data-[state=active]:bg-[#0f5132] data-[state=active]:text-white"
              data-testid="admin-tab"
            >
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="member">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent border-b border-stone-200">
                <TabsTrigger value="login" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f5132]" data-testid="login-subtab">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f5132]" data-testid="register-subtab">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleMemberLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="member-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Email Address</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="your@email.com"
                      value={memberLoginData.email}
                      onChange={(e) => setMemberLoginData({ ...memberLoginData, email: e.target.value })}
                      className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                      required
                      disabled={loading}
                      data-testid="member-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Password</Label>
                    <div className="relative">
                      <Input
                        id="member-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={memberLoginData.password}
                        onChange={(e) => setMemberLoginData({ ...memberLoginData, password: e.target.value })}
                        className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2 pr-10"
                        required
                        disabled={loading}
                        data-testid="member-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#5a5a5a]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 text-sm uppercase tracking-widest disabled:opacity-50"
                    data-testid="member-login-btn"
                  >
                    {loading ? 'Signing In...' : 'Sign In as Member'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleMemberSignup} className="space-y-6">
                  <div>
                    <Label htmlFor="register-name" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Your Name"
                      value={memberSignupData.name}
                      onChange={(e) => setMemberSignupData({ ...memberSignupData, name: e.target.value })}
                      className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                      required
                      disabled={loading}
                      data-testid="register-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Email Address</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={memberSignupData.email}
                      onChange={(e) => setMemberSignupData({ ...memberSignupData, email: e.target.value })}
                      className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                      required
                      disabled={loading}
                      data-testid="register-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-phone" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Phone (Optional)</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={memberSignupData.phone}
                      onChange={(e) => setMemberSignupData({ ...memberSignupData, phone: e.target.value })}
                      className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                      disabled={loading}
                      data-testid="register-phone-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={memberSignupData.password}
                      onChange={(e) => setMemberSignupData({ ...memberSignupData, password: e.target.value })}
                      className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                      required
                      disabled={loading}
                      data-testid="register-password-input"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 text-sm uppercase tracking-widest disabled:opacity-50"
                    data-testid="register-submit-btn"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <Label htmlFor="admin-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@fitsphere.com"
                  value={adminLoginData.email}
                  onChange={(e) => setAdminLoginData({ ...adminLoginData, email: e.target.value })}
                  className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
                  required
                  disabled={loading}
                  data-testid="admin-email-input"
                />
              </div>
              <div>
                <Label htmlFor="admin-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminLoginData.password}
                    onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                    className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2 pr-10"
                    required
                    disabled={loading}
                    data-testid="admin-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#5a5a5a]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0f5132] hover:bg-[#0f5132]/90 text-white rounded-full py-6 text-sm uppercase tracking-widest disabled:opacity-50"
                data-testid="admin-login-btn"
              >
                {loading ? 'Signing In...' : 'Sign In as Admin'}
              </Button>
              <div className="mt-4 text-center text-xs text-[#5a5a5a]">
                <p>Default Admin: admin@fitsphere.com / Admin@123</p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
