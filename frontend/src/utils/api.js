import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/user/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/user/me')
};

// Videos APIs
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`)
};

// Images APIs
export const imagesAPI = {
  getAll: (params) => api.get('/images', { params }),
  getById: (id) => api.get(`/images/${id}`)
};

// Products APIs (includes sessions)
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`)
};

// Orders APIs
export const ordersAPI = {
  createOrder: (data) => api.post('/orders/create-razorpay-order', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  getMyOrders: () => api.get('/orders/user/my-orders')
};

// Chat APIs
export const chatAPI = {
  getMessages: (params) => api.get('/chat/messages', { params }),
  markAsRead: (messageId) => api.put(`/chat/messages/${messageId}/read`)
};

// Testimonials APIs
export const testimonialsAPI = {
  getAll: (params) => api.get('/testimonials', { params }),
  create: (data) => api.post('/testimonials', data)
};
