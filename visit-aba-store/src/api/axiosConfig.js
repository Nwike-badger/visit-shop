import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
// Single source of truth for the token key used across the app.
// AuthContext must use the same key.
export const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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
// Tracks whether a session-expiry toast has already been shown in this page
// lifecycle so the user isn't spammed with multiple toasts on concurrent 401s.
let sessionExpiredToastShown = false;

api.interceptors.response.use(
  (response) => {
    // Reset the guard on any successful response (fresh session)
    sessionExpiredToastShown = false;
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error — no HTTP status available
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 401 UNAUTHORIZED — token is missing, expired, or tampered
    if (status === 401) {
      const hasToken = localStorage.getItem(TOKEN_KEY);
      if (hasToken && !sessionExpiredToastShown) {
        sessionExpiredToastShown = true;
        localStorage.removeItem(TOKEN_KEY);

        toast('For your security, you\'ve been signed out. Please log in again.', {
          icon: '🔐',
          duration: 4000,
        });

        // Small delay so the toast is readable before the redirect
        setTimeout(() => {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 800);
      }
    }

    // 403 FORBIDDEN — authenticated but missing the required role/permission
    else if (status === 403) {
      toast("You don't have access to do that. If you think this is a mistake, please contact support.", {
        icon: '🚫',
        duration: 5000,
      });
    }

    return Promise.reject(error);
  }
);

export default api;