import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY } from '../api/axiosConfig';

// ─── Helper ───────────────────────────────────────────────────────────────────
// Reads ROLE_ADMIN directly from the JWT payload. We do this because the
// backend UserResponse DTO may not include the roles field.
const checkAdminFromToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const payload = token.split('.')[1];

    // Restore standard Base64 from Base64URL encoding (RFC 7519 → RFC 4648)
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');

    const decoded = JSON.parse(window.atob(base64));

    const roles = decoded.roles || decoded.authorities || decoded.role || [];
    
    if (Array.isArray(roles)) {
      return roles.some(
        (r) => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN'
      );
    }
    
    return roles === 'ROLE_ADMIN';
  } catch (error) {
    console.error('Token decoding failed:', error);
    return false;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // 1. Wait until the cold-start auth check finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">
        Verifying Access...
      </div>
    );
  }

  // 2. Not logged in — send to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Admin-only route — verify role from token (most reliable source)
  if (requireAdmin) {
    const isAdmin =
      checkAdminFromToken() ||
      user?.roles?.includes('ROLE_ADMIN') ||
      user?.role === 'ROLE_ADMIN';

    if (!isAdmin) {
      console.warn('ProtectedRoute: Admin role not found — redirecting to homepage.');
      return <Navigate to="/" replace />;
    }
  }

  // 4. All checks passed
  return <Outlet />;
};

export default ProtectedRoute;