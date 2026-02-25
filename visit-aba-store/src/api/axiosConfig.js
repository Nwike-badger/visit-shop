import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // 1. Send Token if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  
  // 2. ALWAYS Ensure Guest ID exists and send it
  // This acts as a fallback if the token is expired/invalid
  let guestId = localStorage.getItem('guest_cart_id');
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('guest_cart_id', guestId);
  }
  config.headers['X-Guest-ID'] = guestId;

  return config;
}, (error) => Promise.reject(error));

export default api;