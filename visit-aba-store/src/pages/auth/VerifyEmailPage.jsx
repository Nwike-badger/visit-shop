import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const ran = useRef(false); // guard against React 18 StrictMode double-run

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    api.post('/v1/auth/verify-email', { token })
      .then(async (res) => {
        const accessToken = res.data?.accessToken;
        const refreshToken = res.data?.refreshToken;
        setStatus('success');
        if (accessToken) {
          // Seamless: store the session + load the profile, then drop them into the store logged in.
          await login(accessToken, refreshToken);
          setTimeout(() => navigate('/', { replace: true }), 1600);
        } else {
          // Fallback (verified but no token returned) — send to login.
          setTimeout(() => navigate('/login', { replace: true }), 1600);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  const resend = async () => {
    if (!resendEmail) { toast.error('Enter your email first.'); return; }
    setResending(true);
    try {
      await api.post('/v1/auth/resend-verification', { email: resendEmail });
      toast.success('If that account needs verifying, a new link is on its way.');
    } catch {
      toast.error('Could not send right now. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">

        {status === 'verifying' && (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
            <p className="text-sm text-gray-500 mt-2">Just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-sm text-gray-500 mb-5">Your account is active. Signing you in…</p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Redirecting</span>
            </div>
            <Link to="/" className="block mt-5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Continue now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Request a new link</label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-medium mb-3"
              />
              <button
                onClick={resend}
                disabled={resending}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Send new link'}
              </button>
            </div>
            <Link to="/login" className="block mt-5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;