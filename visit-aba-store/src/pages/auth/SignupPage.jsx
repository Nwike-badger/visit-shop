import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login } = useAuth();
  const { refreshCart } = useCart();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. STANDARD EMAIL/PASSWORD SIGNUP ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/v1/auth/register', formData);
      
      toast.success("Account created! Please log in.");
      navigate('/login', { state: { from: location.state?.from } });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
      setLoading(false);
    } 
  };

  // --- 2. GOOGLE SIGNUP (Acts as Auto-Login) ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');
    
    try {
      // Backend automatically registers the user if they don't exist during this call!
      const response = await api.post('/v1/auth/google', {
        token: credentialResponse.credential,
        guestId: guestId
      });

      const { accessToken } = response.data;
      
      await login(accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      
      toast.success("Account successfully created with Google!");
      navigate(from, { replace: true });
      
    } catch (error) {
      toast.error("Google sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-2">Join us to track orders and checkout faster</p>
        </div>

        {/* GOOGLE BUTTON */}
        <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google signup popup closed or failed')}
              useOneTap
              shape="rectangular"
              size="large"
              text="signup_with"
              width="100%"
            />
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR REGISTER WITH EMAIL</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* STANDARD FORM */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                <input name="firstName" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" onChange={handleChange} disabled={loading} />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                <input name="lastName" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" onChange={handleChange} disabled={loading} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" onChange={handleChange} disabled={loading} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" onChange={handleChange} disabled={loading} />
            <p className="text-xs text-gray-400 mt-1.5 font-medium">Must be at least 6 characters</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            state={{ from: location.state?.from }} 
            className="font-bold text-blue-600 hover:underline hover:text-blue-800 transition-colors"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;