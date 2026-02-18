// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import { Eye, EyeOff } from 'lucide-react';

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const API = `${BACKEND_URL}/api`;

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginData, setLoginData] = useState({ email: '', password: '' });
//   const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: 'member' });
//   const [adminLoginData, setAdminLoginData] = useState({ email: '', password: '' });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API}/auth/login`, loginData);
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       toast.success('Welcome back!');
//       if (response.data.user.role === 'admin') {
//         navigate('/admin');
//       } else {
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Login failed');
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API}/auth/register`, registerData);
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       toast.success('Account created successfully!');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Registration failed');
//     }
//   };

//   const handleAdminLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API}/auth/login`, adminLoginData);
//       if (response.data.user.role !== 'admin') {
//         toast.error('Admin access required');
//         return;
//       }
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       toast.success('Welcome Admin!');
//       navigate('/admin');
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f5132] to-[#0f5132]/90 flex items-center justify-center p-4" data-testid="login-page">
//       <Card className="w-full max-w-md bg-white rounded-none border-0 shadow-2xl" data-testid="login-card">
//         <div className="bg-gradient-to-r from-[#0f5132] to-[#0f5132]/95 p-12 text-center">
//           <div className="w-20 h-20 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-white font-bold text-3xl">F</span>
//           </div>
//           <h1 className="text-3xl text-white mb-2" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="login-title">FitSphere</h1>
//           <p className="text-white/80 text-sm">Elevate Your Wellness Journey</p>
//         </div>

//         <Tabs defaultValue="member" className="p-8" data-testid="login-tabs">
//           <TabsList className="grid w-full grid-cols-2 mb-8 bg-stone-100 rounded-full p-1">
//             <TabsTrigger 
//               value="member" 
//               className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7f50] data-[state=active]:to-[#d4af37] data-[state=active]:text-white"
//               data-testid="member-tab"
//             >
//               Member
//             </TabsTrigger>
//             <TabsTrigger 
//               value="admin" 
//               className="rounded-full data-[state=active]:bg-[#0f5132] data-[state=active]:text-white"
//               data-testid="admin-tab"
//             >
//               Admin
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="member">
//             <Tabs defaultValue="login" className="w-full">
//               <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent border-b border-stone-200">
//                 <TabsTrigger value="login" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f5132]" data-testid="login-subtab">
//                   Sign In
//                 </TabsTrigger>
//                 <TabsTrigger value="register" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f5132]" data-testid="register-subtab">
//                   Sign Up
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="login">
//                 <form onSubmit={handleLogin} className="space-y-6">
//                   <div>
//                     <Label htmlFor="member-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Email Address</Label>
//                     <Input
//                       id="member-email"
//                       type="email"
//                       placeholder="your@email.com"
//                       value={loginData.email}
//                       onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
//                       className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
//                       required
//                       data-testid="member-email-input"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="member-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Password</Label>
//                     <div className="relative">
//                       <Input
//                         id="member-password"
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="••••••••"
//                         value={loginData.password}
//                         onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                         className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2 pr-10"
//                         required
//                         data-testid="member-password-input"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#5a5a5a]"
//                       >
//                         {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                       </button>
//                     </div>
//                   </div>
//                   <Button 
//                     type="submit" 
//                     className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 text-sm uppercase tracking-widest"
//                     data-testid="member-login-btn"
//                   >
//                     Sign In as Member
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="register">
//                 <form onSubmit={handleRegister} className="space-y-6">
//                   <div>
//                     <Label htmlFor="register-name" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Full Name</Label>
//                     <Input
//                       id="register-name"
//                       type="text"
//                       placeholder="Your Name"
//                       value={registerData.name}
//                       onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
//                       className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
//                       required
//                       data-testid="register-name-input"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="register-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Email Address</Label>
//                     <Input
//                       id="register-email"
//                       type="email"
//                       placeholder="your@email.com"
//                       value={registerData.email}
//                       onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
//                       className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
//                       required
//                       data-testid="register-email-input"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="register-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Password</Label>
//                     <Input
//                       id="register-password"
//                       type="password"
//                       placeholder="••••••••"
//                       value={registerData.password}
//                       onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
//                       className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
//                       required
//                       data-testid="register-password-input"
//                     />
//                   </div>
//                   <Button 
//                     type="submit" 
//                     className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 text-sm uppercase tracking-widest"
//                     data-testid="register-submit-btn"
//                   >
//                     Create Account
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           </TabsContent>

//           <TabsContent value="admin">
//             <form onSubmit={handleAdminLogin} className="space-y-6">
//               <div>
//                 <Label htmlFor="admin-email" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Admin Email</Label>
//                 <Input
//                   id="admin-email"
//                   type="email"
//                   placeholder="admin@fitsphere.com"
//                   value={adminLoginData.email}
//                   onChange={(e) => setAdminLoginData({ ...adminLoginData, email: e.target.value })}
//                   className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2"
//                   required
//                   data-testid="admin-email-input"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="admin-password" className="text-sm uppercase tracking-wider text-[#5a5a5a]">Admin Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="admin-password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     value={adminLoginData.password}
//                     onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
//                     className="bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-4 focus:border-[#0f5132] focus:ring-0 mt-2 pr-10"
//                     required
//                     data-testid="admin-password-input"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#5a5a5a]"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>
//               <Button 
//                 type="submit" 
//                 className="w-full bg-[#0f5132] hover:bg-[#0f5132]/90 text-white rounded-full py-6 text-sm uppercase tracking-widest"
//                 data-testid="admin-login-btn"
//               >
//                 Sign In as Admin
//               </Button>
//             </form>
//           </TabsContent>
//         </Tabs>

//         <div className="px-8 pb-8 text-center">
//           <p className="text-sm text-[#5a5a5a]">
//             New to FitSphere?{' '}
//             <button onClick={() => navigate('/')} className="text-[#0f5132] font-medium hover:underline" data-testid="back-home-link">
//               Explore Our Programs
//             </button>
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }








import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FitSphere</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@fitsphere.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="password-input"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg" data-testid="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-button"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default credentials:</p>
          <p className="font-mono">admin@fitsphere.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
}
