import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // ── Missing token ──
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid link</h2>
          <p className="text-sm text-gray-500 mb-6">This password reset link is missing its token. Request a fresh one below.</p>
          <Link to="/forgot-password" className="block w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/v1/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success ──
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h2>
          <p className="text-sm text-gray-500 mb-6">Your password has been updated. Any active sessions were signed out for security.</p>
          <Link to="/login" className="block w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const eyeBtn = (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Set a new password</h2>
          <p className="text-sm text-gray-500 mt-2">Choose a strong password you haven't used before.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 font-medium">
            {error}
            {(error.includes('expired') || error.includes('invalid') || error.includes('used')) && (
              <Link to="/forgot-password" className="block mt-1.5 font-bold text-red-700 hover:text-red-800 underline">
                Request a new link
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full p-3.5 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              />
              {eyeBtn}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating…' : 'Reset password'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;