import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Token persistence (single source of truth) ──────────────────────────────
export const setAuthTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ─── Helper: is a JWT expired ────────────────────────────────────────────────
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;

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

// ─── Response Interceptor: silent refresh on 401 ─────────────────────────────
let sessionExpiredToastShown = false;
let isRefreshing = false;
let refreshQueue = [];

// Requests that arrived mid-refresh wait here, then retry with the new token.
const flushQueue = (newToken) => {
  refreshQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(api(originalRequest));
    } else {
      reject(originalRequest.__error);
    }
  });
  refreshQueue = [];
};

const handleSessionExpired = () => {
  if (sessionExpiredToastShown) return;
  sessionExpiredToastShown = true;
  clearAuthTokens();
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
  async (error) => {
    if (!error.response) return Promise.reject(error);

    const { status } = error.response;
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const token = localStorage.getItem(TOKEN_KEY);
    const isAuthFlow = url.includes('/v1/auth/');

    // ── 401 → try one silent refresh, then replay the original request ──
    if (status === 401 && token && !isAuthFlow && !originalRequest._retry) {
      originalRequest._retry = true;

      // A refresh is already running — park this request until it resolves.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          originalRequest.__error = error;
          refreshQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Bare axios (NOT `api`) so a failing refresh can't re-enter this interceptor.
        const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, { refreshToken });
        setAuthTokens(data.accessToken, data.refreshToken);
        isRefreshing = false;
        flushQueue(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        flushQueue(null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    // ── 401 that a refresh couldn't fix (already retried) → sign out ──
    if (status === 401 && token && !isAuthFlow) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    // ── 403 handling (unchanged) ──
    if (status === 403) {
      if (token && isTokenExpired(token)) {
        handleSessionExpired();
      } else if (!isAuthFlow) {
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