import axios from 'axios';

// API Base URL
// VITE_API_URL may be either the Render root URL or the full /api URL.
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000/api'
  : 'https://arthur-42nc.onrender.com/api';

function normalizeApiBaseUrl(url) {
  const cleanUrl = (url || DEFAULT_API_BASE_URL)
    .replace(/^VITE_API_URL=/, '')
    .replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Forbidden:', data.message);
      } else if (status === 404) {
        console.error('Not found:', data.message);
      } else if (status >= 500) {
        console.error('Server error:', data.message);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

// API Methods
export const api = {
  // Auth
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  
  // Products
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  searchProducts: (query) => apiClient.get('/products/search', { params: { q: query } }),
  
  // Cart
  getCart: () => apiClient.get('/cart'),
  addToCart: (productOrPayload, quantity) => {
    if (typeof productOrPayload === 'object' && productOrPayload !== null) {
      return apiClient.post('/cart/add', {
        productId: productOrPayload.productId ?? productOrPayload.product_id,
        quantity: productOrPayload.quantity ?? 1,
      });
    }

    return apiClient.post('/cart/add', { productId: productOrPayload, quantity });
  },
  updateCartItem: (itemId, quantity) => apiClient.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => apiClient.delete(`/cart/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
  
  // Orders
  getOrders: () => apiClient.get('/orders/history'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (orderData) => apiClient.post('/orders/create', orderData),
  trackOrder: (orderId) => apiClient.get(`/orders/${orderId}/track`),
  
  // Payments
  createPayment: (paymentData) => apiClient.post('/payment/create-order', paymentData),
  verifyPayment: (paymentData) => apiClient.post('/payment/verify', paymentData),
  
  // RFQ (Request for Quote)
  submitRFQ: (rfqData) => apiClient.post('/rfq', rfqData),
  getRFQs: () => apiClient.get('/rfq'),
  getRFQ: (id) => apiClient.get(`/rfq/${id}`),
  
  // Buy on Credit
  submitCreditRequest: (creditData) => apiClient.post('/credit/request', creditData),
  getCreditStatus: () => apiClient.get('/credit/status'),
  
  // Reviews
  getReviews: (productId) => apiClient.get(`/products/${productId}/reviews`),
  submitReview: (productId, reviewData) => apiClient.post(`/products/${productId}/reviews`, reviewData),
  
  // Support
  submitSupportTicket: (ticketData) => apiClient.post('/support/tickets', ticketData),
  getTickets: () => apiClient.get('/support/tickets'),
  getTicket: (id) => apiClient.get(`/support/tickets/${id}`),
  
  // Grievances
  submitGrievance: (grievanceData) => apiClient.post('/grievances', grievanceData),
  getGrievances: () => apiClient.get('/grievances'),
  getGrievance: (id) => apiClient.get(`/grievances/${id}`),
  
  // User
  getAddresses: () => apiClient.get('/user/addresses'),
  addAddress: (addressData) => apiClient.post('/user/addresses', addressData),
  updateAddress: (id, addressData) => apiClient.put(`/user/addresses/${id}`, addressData),
  deleteAddress: (id) => apiClient.delete(`/user/addresses/${id}`),
};

export default apiClient;
