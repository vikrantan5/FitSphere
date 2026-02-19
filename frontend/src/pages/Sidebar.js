import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Video,
  Image,
  ShoppingBag,
  ShoppingCart,
  Users,
  Bell,
  LogOut,
  Dumbbell,
  Calendar,
  Layers,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/videos', icon: Video, label: 'Videos' },
    { path: '/admin/images', icon: Image, label: 'Images' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Products' },
    { path: '/admin/programs', icon: Layers, label: 'Programs' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#0f5132] to-[#0a3d25] text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-emerald-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-normal" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere</h1>
          </div>
        </div>
        <p className="text-sm text-emerald-200 uppercase tracking-wider">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-full mb-2 transition-all ${
                isActive
                  ? 'bg-white text-[#0f5132] font-semibold shadow-lg'
                  : 'text-white hover:bg-emerald-800/50'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-700/50">
        <div className="mb-4 px-4">
          <p className="text-xs text-emerald-200 uppercase tracking-wider">Logged in as</p>
          <p className="font-semibold truncate mt-1">{admin?.name || admin?.email || 'Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="flex items-center gap-3 px-4 py-3 rounded-full w-full bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] hover:opacity-90 transition-all text-white font-semibold shadow-lg"
        >
          <LogOut size={20} />
          <span className="text-sm uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </div>
  );
}
