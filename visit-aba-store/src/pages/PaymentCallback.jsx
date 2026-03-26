import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

const MAX_ATTEMPTS = 8;
const POLL_INTERVAL = 3000;
const INITIAL_DELAY = 2500; 

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, refreshCart } = useCart();

  const [status, setStatus] = useState('verifying');
  const [attemptCount, setAttemptCount] = useState(0);
  const timerRef = useRef(null);

  const orderId = searchParams.get('paymentReference');
  const monnifyStatus = searchParams.get('paymentStatus'); 
  const transactionRef = searchParams.get('transactionReference');

  useEffect(() => {
    if (!orderId || (monnifyStatus && monnifyStatus !== 'PAID')) {
      setStatus('failed');
      return;
    }

    let attempts = 0;

    const poll = async () => {
      attempts++;
      setAttemptCount(attempts);

      try {
        const res = await api.get(`/v1/orders/verify/${orderId}`);
        const orderStatus = res.data.status;

        if (['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(orderStatus)) {
          await clearCart();
          refreshCart();
          setStatus('success');
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          setStatus('failed');
        }
      } catch {
        if (attempts < MAX_ATTEMPTS) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          setStatus('failed');
        }
      }
    };

    timerRef.current = setTimeout(poll, INITIAL_DELAY);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [orderId, monnifyStatus, clearCart, refreshCart]); 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans px-4 bg-gray-50/50 relative overflow-hidden">
      
      {/* Subtle Background Glow for premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* ── 1. Verifying State ───────────────────────────────────────────── */}
      {status === 'verifying' && (
        <div className="flex flex-col items-center bg-white p-10 sm:p-14 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 max-w-md w-full text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
             <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-50"></div>
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative z-10 border border-blue-100/50">
               <Loader2 size={36} className="text-blue-600 animate-spin" />
             </div>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Securing Your Order</h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">
            Please don't close this window. We are confirming your payment with the bank.
          </p>
          
          {attemptCount > 1 && (
            <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verification Status</span>
                 <span className="text-[10px] text-blue-600 font-black">{Math.round((attemptCount / MAX_ATTEMPTS) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(attemptCount / MAX_ATTEMPTS) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Success State ─────────────────────────────────────────────── */}
      {status === 'success' && (
        <div className="flex flex-col items-center bg-white p-10 sm:p-14 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 max-w-md w-full text-center relative z-10 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Successful!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Thank you for your purchase. We are preparing your items for delivery.
          </p>

          {transactionRef && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 w-full flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Transaction ID</span>
              <span className="text-sm font-mono font-black text-gray-900 break-all bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">{transactionRef}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to="/orders"
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:-translate-y-0.5 transition-all shadow-lg flex justify-center items-center"
            >
              Track Order
            </Link>
            {/* The "Really Good" Home Alternative */}
            <Link
              to="/products"
              className="flex-1 bg-blue-50 text-blue-700 border border-blue-100 py-4 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex justify-center items-center gap-2 group"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Explore Drops
            </Link>
          </div>
        </div>
      )}

      {/* ── 3. Failed State ──────────────────────────────────────────────── */}
      {status === 'failed' && (
        <div className="flex flex-col items-center bg-white p-10 sm:p-14 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 max-w-md w-full text-center relative z-10 animate-in shake duration-500">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Failed</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">
            We couldn't authorize your payment. No worries, your items are still saved in your cart. If you were debited, it will be automatically reversed.
          </p>
          
          <div className="flex flex-col gap-3 w-full mb-6">
            <button
              onClick={async () => {
                if (!orderId) { navigate('/checkout'); return; }
                try {
                  const res = await api.post(`/v1/payments/retry/${orderId}`);
                  if (res.data?.checkoutUrl) window.location.href = res.data.checkoutUrl;
                } catch {
                  navigate('/checkout');
                }
              }}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:shadow-lg transition-all flex justify-center items-center gap-2"
            >
              Try Another Method <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Check Order Status
            </button>
          </div>

          {/* Gentle Escape Hatch */}
          <Link to="/products" className="text-xs font-bold text-gray-400 hover:text-gray-900 inline-flex items-center gap-1 transition-colors">
             <ArrowLeft size={12} /> Return to storefront
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;