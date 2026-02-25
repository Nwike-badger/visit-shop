import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To remember where they came from (Checkout)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calls your Backend: AuthController (or UserController)
      await api.post('/v1/auth/register', formData);

      // On success, redirect to Login, keeping the "from" state
      // So Login knows to send them back to Checkout
      navigate('/login', { 
        state: { 
            from: location.state?.from,
            message: "Account created! Please log in." 
        } 
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-2">Join us to track orders and checkout faster</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input name="firstName" required className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-100 outline-none" onChange={handleChange} />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input name="lastName" required className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-100 outline-none" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" required className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-100 outline-none" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-100 outline-none" onChange={handleChange} />
            <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            state={{ from: location.state?.from }} 
            className="font-bold text-blue-600 hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;