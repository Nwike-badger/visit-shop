import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Your existing logic)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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

// 🔥 NEW: Response Interceptor (The 401 Shield)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Prevent spamming toast messages if multiple requests fail at once
      if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          toast.error("Session expired. Please log in again.");
          // Send them to login and preserve intent
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;