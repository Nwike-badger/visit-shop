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
    const url = error.config?.url || '';
    const token = localStorage.getItem(TOKEN_KEY);

    // Auth screens (login, register, verify, resend, forgot/reset) show their own
    // tailored errors — never let the global handler toast over them.
    const isAuthFlow = url.includes('/v1/auth/');

    if (status === 401) {
      if (token) handleSessionExpired();
    } else if (status === 403) {
      // A truly expired token can come back as 403 on some routes — treat as session expiry.
      if (token && isTokenExpired(token)) {
        handleSessionExpired();
      } else if (!isAuthFlow) {
        // Only show the generic "no access" message for non-auth requests.
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