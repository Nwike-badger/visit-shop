import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  
  let guestId = localStorage.getItem('guest_cart_id');
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('guest_cart_id', guestId);
  }
  config.headers['X-Guest-ID'] = guestId;

  return config;
}, (error) => Promise.reject(error));


// Response Interceptor (The Shield)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      
      // 🚨 401 UNAUTHORIZED (Token expired or completely invalid)
      if (error.response.status === 401) {
        const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        if (hasToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            toast.error("Session expired. Please log in again.");
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      
      // 🚨 403 FORBIDDEN (Valid token, but lacks Admin Roles)
      else if (error.response.status === 403) {
        toast.error("Access Denied: You do not have permission to perform this action.");
      }
      
    }
    return Promise.reject(error);
  }
);

export default api;