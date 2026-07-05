import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api, { TOKEN_KEY, setAuthTokens, clearAuthTokens } from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = useCallback((showToast = true) => {
    // Best-effort server logout — deletes the refresh token so it can't be reused.
    // Token passed explicitly because we clear storage on the very next line.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.post('/v1/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
         .catch(() => {}); // ignore failures; local sign-out happens regardless
    }

    clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);

    if (showToast) {
      toast("You've been signed out. See you soon! 👋", { duration: 3000 });
    }
  }, []);

  // ─── login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (accessToken, refreshToken = null, userData = null) => {
    setAuthTokens(accessToken, refreshToken);
    setIsAuthenticated(true);

    if (userData) {
      setUser(userData);
    } else {
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
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          // If the access token is expired, the interceptor silently refreshes
          // and this still succeeds — the user stays logged in.
          const res = await api.get('/v1/users/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
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