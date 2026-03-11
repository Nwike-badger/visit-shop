import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

// 🚀 HELPER: Instantly decode the JWT token to check roles without waiting for React State
const getRolesFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    // Check all common Spring Boot Security mapping styles
    const roles = decoded.roles || decoded.authorities || decoded.role || [];
    if (Array.isArray(roles)) {
       return roles.some(r => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN');
    }
    return roles === 'ROLE_ADMIN';
  } catch (e) {
    return false;
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();
  const { login } = useAuth(); 

  // Capture where the user was trying to go before logging in
  const from = location.state?.from?.pathname || "/";

  // --- 1. STANDARD EMAIL/PASSWORD LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const guestId = localStorage.getItem('guest_cart_id');

    try {
      const response = await api.post('/v1/auth/login', {
        username: email,
        password: password,
        guestId: guestId // Merges cart
      });

      const { accessToken } = response.data;
      
      // Update global context
      await login(accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      
      // 🔥 SMART ROUTING ENGINE
      const isAdmin = getRolesFromToken(accessToken);
      
      if (isAdmin) {
          toast.success("Welcome back to the command center, Admin!", { icon: '🛡️' });
          const destination = (from === "/" || from === "/login") ? "/admin/products" : from;
          
          // 🔥 Give React Context 100ms to update the global user state before routing
          setTimeout(() => {
              navigate(destination, { replace: true });
          }, 100);
      } else {
          toast.success("Welcome back!");
          navigate(from, { replace: true });
      }

    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    } 
  };

  // --- 2. GOOGLE LOGIN ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');
    
    try {
      const response = await api.post('/v1/auth/google', {
        token: credentialResponse.credential,
        guestId: guestId
      });

      const { accessToken } = response.data;
      
      // Update global context
      await login(accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      
      // 🔥 SMART ROUTING ENGINE (For Google Admins)
      const isAdmin = getRolesFromToken(accessToken);
      
      if (isAdmin) {
          toast.success("Admin authenticated via Google.", { icon: '🛡️' });
          const destination = (from === "/" || from === "/login") ? "/admin/products" : from;
          navigate(destination, { replace: true });
      } else {
          toast.success("Successfully logged in with Google!");
          navigate(from, { replace: true });
      }
      
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-2">Log in to continue shopping</p>
        </div>
        
        {/* GOOGLE BUTTON */}
        <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login popup closed or failed')}
              useOneTap
              shape="rectangular"
              size="large"
              text="signin_with"
              width="100%"
            />
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* ERROR MESSAGE */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 font-medium">{error}</div>}

        {/* STANDARD FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-gray-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            state={{ from: location.state?.from }} 
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create one now
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;