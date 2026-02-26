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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/user/me'),
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


// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (productId, data) => api.put(`/cart/update/${productId}`, data),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
};


// Order APIs
export const orderAPI = {
  createRazorpay: (data) => api.post('/orders/create-razorpay-order', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
  getAll: (params) => api.get('/orders', { params }),
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

// Chat APIs
export const chatAPI = {
  getMessages: (params) => api.get('/chat/messages', { params }),
  markRead: (messageId) => api.put(`/chat/messages/${messageId}/read`),
};

// Testimonial APIs
export const testimonialAPI = {
  create: (data) => api.post('/testimonials', data),
  getAll: (params) => api.get('/testimonials', { params }),
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

// User Order APIs
export const userOrderAPI = {
  getMyOrders: (params) => api.get('/orders/user/my-orders', { params }),
};

export default api;
