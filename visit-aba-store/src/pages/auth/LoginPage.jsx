import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const getRolesFromToken = (token) => {
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✨ Added toggle state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();
  const { login } = useAuth(); 

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const guestId = localStorage.getItem('guest_cart_id');

    try {
      const response = await api.post('/v1/auth/login', {
        username: email,
        password: password,
        guestId: guestId 
      });

      const { accessToken } = response.data;
      await login(accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      
      const isAdmin = getRolesFromToken(accessToken);
      
      if (isAdmin) {
          toast.success("Welcome back to the command center, Admin!", { icon: '🛡️' });
          const destination = (from === "/" || from === "/login") ? "/admin/products" : from;
          setTimeout(() => navigate(destination, { replace: true }), 100);
      } else {
          toast.success("Welcome back!");
          navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    } 
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');
    
    try {
      const response = await api.post('/v1/auth/google', {
        token: credentialResponse.credential,
        guestId: guestId
      });

      const { accessToken } = response.data;
      await login(accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      
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

        <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 font-medium">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          
          <div>
            {/* ✨ Added Forgot Password Link in the Label row */}
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot?
              </Link>
            </div>
            {/* ✨ Show/Hide Password Wrapper */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full p-3.5 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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