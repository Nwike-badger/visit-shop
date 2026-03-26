import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stable reference — safe to use as a useEffect dependency anywhere in the app
  const logout = useCallback((showToast = true) => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    if (showToast) toast.success('Logged out successfully');
    // Navigation is intentionally left to the calling component via React Router
  }, []);

  // Stable reference — wrapping in useCallback prevents re-creating on every render
  const login = useCallback(async (token, userData = null) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);

    if (userData) {
      // Caller already has the user object (e.g. login response body) — use it directly
      setUser(userData);
    } else {
      // Fallback: fetch the current user profile from the server
      try {
        const res = await api.get('/v1/users/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user after login', error);
        toast.error('Failed to load user profile');
      }
    }
  }, []);

  // Cold-start auth check: runs once on app mount to restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Axios interceptor in axiosConfig must attach the token automatically.
          // If it doesn't exist, add: config.headers.Authorization = `Bearer ${token}`
          const res = await api.get('/v1/users/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is expired or invalid — clear it silently
          console.error('Auth check failed:', error);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  // Stable reference for updating user data from child pages (e.g. profile edit)
  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
  }, []);

  
  const contextValue = useMemo(
    () => ({ user, isAuthenticated, loading, login, logout, updateUser }),
    [user, isAuthenticated, loading, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);