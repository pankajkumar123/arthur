/**
 * API configuration for frontend
 * Centralized API settings and constants
 */

const API_CONFIG = {
  // Use same-origin API path in production by default (e.g., Hostinger domain + /api)
  baseURL: (() => {
    const fallback = import.meta.env.DEV
      ? 'http://localhost:4000/api'
      : 'https://arthur-42nc.onrender.com/api';
    const cleanUrl = (import.meta.env.VITE_API_URL || fallback)
      .replace(/^VITE_API_URL=/, '')
      .replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  })(),
  timeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/me'
  },
  
  PRODUCTS: {
    LIST: '/api/products',
    GET: (id) => `/api/products/${id}`,
    SEARCH: '/api/products/search'
  },
  
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    REMOVE: '/api/cart/remove',
    UPDATE: '/api/cart/update',
    CLEAR: '/api/cart/clear'
  },
  
  ORDERS: {
    CREATE: '/api/orders/create',
    LIST: '/api/orders/history',
    GET: (id) => `/api/orders/${id}`,
    TRACK: (id) => `/api/orders/${id}/track`
  },
  
  PAYMENTS: {
    CREATE: '/api/payment/create-order',
    VERIFY: '/api/payment/verify'
  },
  
  HEALTH: {
    STATUS: '/api/health',
    DB: '/api/health/db'
  }
};

export default API_CONFIG;
