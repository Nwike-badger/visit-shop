import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Define logout first using useCallback so it's stable and safe to call anywhere
  const logout = useCallback((showToast = true) => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    if (showToast) toast.success("Logged out successfully");
    // We let React Router or the component handle navigation (e.g. navigate('/'))
  }, []);

  // 2. Define login
  const login = async (token, userData = null) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    
    if (userData) {
      setUser(userData);
    } else {
      try {
        const res = await api.get('/v1/users/me');
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user after login", error);
        toast.error("Failed to load user profile");
      }
    }
  };

  // 3. NOW it is safe to use initAuth in useEffect
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/v1/users/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          // Now this works perfectly
          logout(false); 
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);