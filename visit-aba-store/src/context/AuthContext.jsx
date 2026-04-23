import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api, { TOKEN_KEY } from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  const logout = useCallback((showToast = true) => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);

    if (showToast) {
      toast("You've been signed out. See you soon! 👋", {
        duration: 3000,
      });
    }
    // Navigation is left to the calling component so it can use React Router.
  }, []);

  // ─── login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (token, userData = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    setIsAuthenticated(true);

    if (userData) {
      // Caller already holds the user object — use it directly.
      setUser(userData);
    } else {
      // Fallback: fetch the profile from the server.
      try {
        const res = await api.get('/v1/users/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
        toast.error("We couldn't load your profile right now. Please refresh the page.");
      }
    }
  }, []);

  // ─── Cold-start session restore ──────────────────────────────────────────
  // Runs once on mount to rehydrate auth state from localStorage.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        try {
          const res = await api.get('/v1/users/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is expired or invalid — clear it silently (no toast on cold start).
          console.error('Auth check failed:', error);
          logout(false);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [logout]);

  
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