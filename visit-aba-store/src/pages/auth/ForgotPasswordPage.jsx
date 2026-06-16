import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { MailCheck, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async () => {
    try {
      await api.post('/v1/auth/forgot-password', { email });
      return true;
    } catch {
      toast.error('Something went wrong. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await submit();
    if (ok) setSubmitted(true);
    setLoading(false);
  };

  const resend = async () => {
    setResending(true);
    const ok = await submit();
    if (ok) toast.success('Reset link sent again.');
    setResending(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MailCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-1">
            If an account exists for
          </p>
          <p className="text-sm font-bold text-gray-900 mb-4">{email}</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            we've sent a link to reset your password. It expires in 15 minutes. Don't forget to check spam.
          </p>
          <button
            onClick={resend}
            disabled={resending}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50 mb-3"
          >
            {resending ? 'Sending…' : 'Resend link'}
          </button>
          <Link to="/login" className="block text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors mb-6">
          <ArrowLeft size={15} /> Back to login
        </Link>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your email and we'll send you a link to reset it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Remembered it?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;