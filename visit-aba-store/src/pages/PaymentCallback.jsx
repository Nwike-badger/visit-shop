import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

const MAX_ATTEMPTS    = 8;
const POLL_INTERVAL   = 3000; // ms between polls
const INITIAL_DELAY   = 2500; // ms before first poll — gives webhook time to arrive

const PaymentCallback = () => {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { clearCart, refreshCart } = useCart();

  const [status, setStatus]           = useState('verifying');
  const [attemptCount, setAttemptCount] = useState(0);
  const timerRef = useRef(null);

  // Monnify appends these to the redirect URL automatically:
  // ?paymentReference=ORDER_ID&paymentStatus=PAID&transactionReference=MNFY|...
  const orderId           = searchParams.get('paymentReference');
  const monnifyStatus     = searchParams.get('paymentStatus');    // PAID | FAILED | PENDING
  const transactionRef    = searchParams.get('transactionReference');

  useEffect(() => {
    // ── No order ID at all — bad redirect ──────────────────────────────────
    if (!orderId) {
      setStatus('failed');
      return;
    }

    // ── Monnify already told us it failed — don't bother polling ──────────
    if (monnifyStatus && monnifyStatus !== 'PAID') {
      setStatus('failed');
      return;
    }

    let attempts = 0;

    const poll = async () => {
      attempts++;
      setAttemptCount(attempts);

      try {
        const res         = await api.get(`/v1/orders/verify/${orderId}`);
        const orderStatus = res.data.status;

        if (
          orderStatus === 'PROCESSING' ||
          orderStatus === 'CONFIRMED'  ||
          orderStatus === 'SHIPPED'    ||
          orderStatus === 'DELIVERED'
        ) {
          // ✅ Confirmed — clear cart NOW, before showing success
          await clearCart();
          refreshCart();
          setStatus('success');
          return;
        }

        // Still PENDING_PAYMENT — webhook may not have arrived yet
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
  }, [orderId, monnifyStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans px-4 bg-gray-50">

      {/* ── Verifying ─────────────────────────────────────────────────────── */}
      {status === 'verifying' && (
        <div className="flex flex-col items-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Loader2 size={36} className="text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Confirming Payment</h2>
          <p className="text-gray-500 text-sm mb-6">
            Please stay on this page while we verify your transaction. This takes just a moment.
          </p>
          {attemptCount > 1 && (
            <div className="bg-gray-50 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400 font-medium">
                Still checking... attempt {attemptCount} of {MAX_ATTEMPTS}
              </p>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(attemptCount / MAX_ATTEMPTS) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Success ───────────────────────────────────────────────────────── */}
      {status === 'success' && (
        <div className="flex flex-col items-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-2 text-sm">
            Your order has been confirmed and is being processed.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            A receipt has been sent to your email inbox.
          </p>

          {transactionRef && (
            <div className="bg-gray-50 rounded-xl p-3 mb-8 w-full">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Transaction Reference</p>
              <p className="text-xs font-mono font-bold text-gray-700 break-all">{transactionRef}</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Link
              to="/orders"
              className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-colors flex justify-center items-center gap-2"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              <ShoppingBag size={15} /> Keep Shopping
            </Link>
          </div>
        </div>
      )}

      {/* ── Failed ────────────────────────────────────────────────────────── */}
      {status === 'failed' && (
        <div className="flex flex-col items-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Not Confirmed</h2>
          <p className="text-gray-500 mb-2 text-sm">
            We couldn't verify your payment at this time.
          </p>
          <p className="text-gray-400 mb-8 text-xs leading-relaxed">
            If you were debited, your order will be updated automatically within a few minutes. 
            Check <strong>My Orders</strong> for the latest status, or contact support if the issue persists.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-colors"
            >
              Check My Orders
            </button>
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
              className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Retry Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;