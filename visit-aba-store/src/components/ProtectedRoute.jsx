import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 🚀 HELPER: Decodes the JWT token to find the real roles
const checkAdminFromToken = () => {
  // Check your localStorage for whatever key your app uses (token, accessToken, jwt, etc.)
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 
  if (!token) return false;
  
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    const roles = decoded.roles || decoded.authorities || decoded.role || [];
    if (Array.isArray(roles)) {
       return roles.some(r => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN');
    }
    return roles === 'ROLE_ADMIN';
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth(); 

  // 1. Show nothing while checking authentication status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Verifying Access...</div>;
  }

  // 2. If not logged in at all, kick to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the route requires an Admin, check the token directly
  if (requireAdmin) {
    // We check the token directly because the backend UserResponse DTO might be missing the roles field
    const isAdmin = checkAdminFromToken() || 
                    user?.roles?.includes('ROLE_ADMIN') || 
                    user?.role === 'ROLE_ADMIN';
    
    if (!isAdmin) {
      console.warn("Protected Route: No Admin role found in token or user object. Booting to homepage.");
      return <Navigate to="/" replace />;
    }
  }

  // 4. If all checks pass, render the Admin Portal!
  return <Outlet />;
};

export default ProtectedRoute;