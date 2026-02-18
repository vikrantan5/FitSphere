import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from either admin_token or token
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  // Admin auth
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  
  // User auth
  userLogin: (credentials) => api.post('/auth/user/login', credentials),
  userRegister: (data) => api.post('/auth/register', data),
  getUserMe: () => api.get('/auth/user/me'),
};

// Video APIs
export const videoAPI = {
  upload: (formData) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/videos', { params }),
  getOne: (id) => api.get(`/videos/${id}`),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

// Image APIs
export const imageAPI = {
  upload: (formData) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/images', { params }),
  delete: (id) => api.delete(`/images/${id}`),
};

// Product APIs
export const productAPI = {
  create: (data) => api.post('/products', data),
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Order APIs
export const orderAPI = {
  createRazorpay: (data) => api.post('/orders/create-razorpay-order', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: (params) => api.get('/orders/user/my-orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, null, {
    params: { order_status: status },
  }),
  exportCSV: () => api.get('/orders/export/csv', { responseType: 'blob' }),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// Trainer APIs
export const trainerAPI = {
  create: (data) => api.post('/trainers', data),
  getAll: (params) => api.get('/trainers', { params }),
  getOne: (id) => api.get(`/trainers/${id}`),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  delete: (id) => api.delete(`/trainers/${id}`),
};

// Program APIs
export const programAPI = {
  create: (data) => api.post('/programs', data),
  getAll: (params) => api.get('/programs', { params }),
  getOne: (id) => api.get(`/programs/${id}`),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getMyBookings: (params) => api.get('/bookings/user/my-bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getAvailableSlots: (trainerId, date) => api.get(`/bookings/trainer/${trainerId}/available-slots`, {
    params: { booking_date: date }
  }),
  createPayment: (bookingId) => api.post(`/bookings/${bookingId}/create-payment`),
  verifyPayment: (bookingId, data) => api.post(`/bookings/${bookingId}/verify-payment`, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
  exportCSV: () => api.get('/bookings/export/csv', { responseType: 'blob' }),
};

// Testimonial APIs
export const testimonialAPI = {
  create: (data) => api.post('/testimonials', data),
  getAll: (params) => api.get('/testimonials', { params }),
  approve: (id) => api.put(`/testimonials/${id}/approve`),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

// Chat APIs (Socket.IO handled separately)
export const chatAPI = {
  getMessages: (params) => api.get('/chat/messages', { params }),
  getAdminMessages: (params) => api.get('/chat/admin/messages', { params }),
  markRead: (messageId) => api.put(`/chat/messages/${messageId}/read`),
};

export default api;
