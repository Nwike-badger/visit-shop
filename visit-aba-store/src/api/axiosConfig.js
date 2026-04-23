import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

export const TOKEN_KEY = 'token';

// ─── Helper: check if a JWT is expired ───────────────────────────────────────
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat unreadable token as expired
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // removed ngrok header
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
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
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
let sessionExpiredToastShown = false;

const handleSessionExpired = () => {
  if (sessionExpiredToastShown) return;
  sessionExpiredToastShown = true;
  localStorage.removeItem(TOKEN_KEY);
  toast("For your security, you've been signed out. Please log in again.", {
    icon: '🔐',
    duration: 4000,
  });
  setTimeout(() => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }, 800);
};

api.interceptors.response.use(
  (response) => {
    sessionExpiredToastShown = false;
    return response;
  },
  (error) => {
    if (!error.response) return Promise.reject(error);

    const { status } = error.response;
    const token = localStorage.getItem(TOKEN_KEY);

    if (status === 401) {
      if (token) handleSessionExpired();
    } else if (status === 403) {
      // If they have a token but it's expired, the backend may return 403
      // instead of 401 on some routes — treat it as a session expiry
      if (token && isTokenExpired(token)) {
        handleSessionExpired();
      } else {
        toast("You don't have access to do that. If you think this is a mistake, please contact support.", {
          icon: '🚫',
          duration: 5000,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;