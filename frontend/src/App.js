import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VideosPage from './pages/VideosPage';
import ImagesPage from './pages/ImagesPage';
import ProductsPage from './pages/ProductsPage';
import ProgramsPage from './pages/ProgramsPage';
import BookingsPage from './pages/BookingsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import UserDashboard from './pages/UserDashboard';
import UserLandingPage from './pages/UserLandingPage';
import UserSessionsPage from './pages/UserSessionsPage';
import UserVideosPage from './pages/UserVideosPage';
import UserShopPage from './pages/UserShopPage';
import UserCartPage from './pages/UserCartPage';
import UserChatPage from './pages/UserChatPage';
import UserTestimonialsPage from './pages/UserTestimonialsPage';

// Protected Route Component for Admin
function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected Route Component for User
function UserRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'user') {
      setIsUser(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (token && userRole) {
      if (userRole === 'admin') {
        setRedirectPath('/admin/dashboard');
      } else if (userRole === 'user') {
        setRedirectPath('/user/dashboard');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <AdminRoute>
              <VideosPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/images"
          element={
            <AdminRoute>
              <ImagesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <OrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <NotificationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <AdminRoute>
              <ProgramsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <BookingsPage />
            </AdminRoute>
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />
        <Route
          path="/user/sessions"
          element={
            <UserRoute>
              <UserSessionsPage />
            </UserRoute>
          }
        />
        <Route
          path="/user/videos"
          element={
            <UserRoute>
              <UserVideosPage />
            </UserRoute>
          }
        />
        <Route
          path="/user/shop"
          element={
            <UserRoute>
              <UserShopPage />
            </UserRoute>
          }
        />
        <Route
          path="/user/cart"
          element={
            <UserRoute>
              <UserCartPage />
            </UserRoute>
          }
        />
        <Route
          path="/user/chat"
          element={
            <UserRoute>
              <UserChatPage />
            </UserRoute>
          }
        />
        <Route
          path="/user/testimonials"
          element={
            <UserRoute>
              <UserTestimonialsPage />
            </UserRoute>
          }
        />

        {/* Public Landing Page */}
        <Route path="/" element={<UserLandingPage />} />

        {/* Default Route */}
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
