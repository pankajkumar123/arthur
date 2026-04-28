// Auto-detect API base URL based on environment
const getApiBase = () => {
  // Allow manual override via window.API_BASE
  if (window.API_BASE) return window.API_BASE;
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  
  // Production environment (deployed on Render, Vercel, Netlify, etc.)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 'https://saiscientifics-api.onrender.com/api';
  }
  
  // Development environment
  return 'http://localhost:4000/api';
};

const API_BASE = getApiBase();
window.API_BASE = API_BASE;

// Log the API base for debugging
console.log('🔗 API Base URL:', API_BASE);

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('customerToken');
  const headers = {
    ...(options.headers || {})
  };
  
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.error || 'Request failed';
    
    // Handle token expiration
    if (response.status === 401 && token) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerName');
      if (!path.includes('/auth/')) {
        window.location.href = 'Login.html';
      }
    }
    
    throw new Error(message);
  }

  return response.json();
}

window.apiFetch = apiFetch;
