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
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/images', icon: Image, label: 'Images' },
    { path: '/products', icon: ShoppingBag, label: 'Products' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#0f5132] to-[#0a3d25] text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Henna Heaven</h1>
        <p className="text-sm text-emerald-200">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-white text-[#0f5132] font-semibold shadow-lg'
                  : 'text-white hover:bg-emerald-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-700">
        <div className="mb-4 px-4">
          <p className="text-sm text-emerald-200">Logged in as</p>
          <p className="font-semibold truncate">{admin?.email || 'Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-white hover:bg-emerald-800 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
