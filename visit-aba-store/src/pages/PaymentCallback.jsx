import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Loader2, ArrowRight, ShieldAlert, Sparkles,
  ArrowLeft, Clock, RefreshCw, PackageSearch
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

const MAX_ATTEMPTS = 10;        // ~32s of polling after the initial delay
const POLL_INTERVAL = 3000;
const INITIAL_DELAY = 2500;

// What our SERVER reports (the only source of truth for a confirmed order).
const SUCCESS_STATUSES = ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const DEAD_STATUSES = ['CANCELLED', 'FAILED'];

// Redirect ?status= hints from the gateway. NEVER trusted as proof of payment —
// used ONLY to choose the right message if our own polling times out.
// (Flutterwave sends "completed"; Monnify sends "PAID"; etc.)
const POSITIVE_HINTS = ['completed', 'successful', 'success', 'paid'];
const CANCEL_HINTS = ['cancelled', 'canceled'];

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, refreshCart } = useCart();

  const [status, setStatus] = useState('verifying');   // verifying | success | pending | failed
  const [wasCancelled, setWasCancelled] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Order reference. reference/paymentReference cover Paystack & Monnify; tx_ref covers Flutterwave.
  const orderId =
    searchParams.get('reference') ||
    searchParams.get('paymentReference') ||
    searchParams.get('tx_ref');

  const transactionRef =
    searchParams.get('transactionReference') ||
    searchParams.get('transaction_id');

  // Raw redirect hint — normalized. Flutterwave: ?status=; Monnify: ?paymentStatus=
  const redirectHint = (
    searchParams.get('status') ||
    searchParams.get('paymentStatus') ||
    ''
  ).toLowerCase();

  useEffect(() => {
    mountedRef.current = true;

    const positiveHint = POSITIVE_HINTS.includes(redirectHint);
    const cancelHint = CANCEL_HINTS.includes(redirectHint);

    // No order reference in the URL → nothing we can verify.
    if (!orderId) {
      setStatus('failed');
      return;
    }

    let attempts = 0;

    // Called when polling runs out without a definite server answer.
    // The order is still PENDING_PAYMENT — decide the message using the gateway hint.
    const settleOnTimeout = () => {
      if (!mountedRef.current) return;
      if (positiveHint) {
        // Gateway said the charge went through — our webhook is just late.
        // Reassure (don't alarm) and release the cart; the order already exists.
        clearCart().finally(() => { if (mountedRef.current) refreshCart(); });
        setStatus('pending');
      } else if (cancelHint) {
        setWasCancelled(true);
        setStatus('failed');
      } else {
        setStatus('failed');
      }
    };

    const poll = async () => {
      if (!mountedRef.current) return;
      attempts++;
      setAttemptCount(attempts);

      try {
        // Smart verify: fast path reads our DB, slow path asks the gateway of record.
        // _t cache-busts so we never get served a stale 304.
        const res = await api.get(`/v1/payments/verify/${orderId}`, {
          params: { _t: Date.now() },
        });
        const orderStatus = res.data?.status;

        if (SUCCESS_STATUSES.includes(orderStatus)) {
          await clearCart();
          if (mountedRef.current) refreshCart();
          if (mountedRef.current) setStatus('success');
          return;
        }

        if (DEAD_STATUSES.includes(orderStatus)) {
          if (mountedRef.current) {
            setWasCancelled(cancelHint || orderStatus === 'CANCELLED');
            setStatus('failed');
          }
          return;
        }

        // Still PENDING_PAYMENT — keep polling until we run out.
        if (attempts < MAX_ATTEMPTS) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          settleOnTimeout();
        }
      } catch {
        // Network hiccup — retry until we run out, then settle on the hint.
        if (attempts < MAX_ATTEMPTS) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          settleOnTimeout();
        }
      }
    };

    timerRef.current = setTimeout(poll, INITIAL_DELAY);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // Only orderId matters; the hint params are stable for a given orderId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Retry reuses the SAME order on the backend — no new stock hold, no double charge.
  const handleRetry = async () => {
    if (!orderId) { navigate('/checkout'); return; }
    setRetrying(true);
    setRetryError('');
    try {
      const res = await api.post(`/v1/payments/retry/${orderId}`);
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl; // leaving the page
        return;
      }
      navigate('/checkout');
    } catch (e) {
      if (!mountedRef.current) return;
      setRetrying(false);
      setRetryError(
        e?.response?.data?.error ||
        'Could not restart payment. Please try again from your cart.'
      );
    }
  };

  const card =
    'flex flex-col items-center bg-white p-10 sm:p-14 rounded-[2rem] ' +
    'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 ' +
    'max-w-md w-full text-center relative z-10';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans px-4 bg-gray-50/50 relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* ── VERIFYING ─────────────────────────────────────────────── */}
      {status === 'verifying' && (
        <div className={`${card} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
          <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-50" />
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative z-10 border border-blue-100/50">
              <Loader2 size={36} className="text-blue-600 animate-spin" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Confirming Your Payment</h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">
            Please don't close this window. We're securely confirming your payment with the bank.
          </p>

          {attemptCount > 1 && (
            <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verifying</span>
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

      {/* ── SUCCESS ───────────────────────────────────────────────── */}
      {status === 'success' && (
        <div className={`${card} animate-in zoom-in-95 duration-500`}>
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Successful</h2>
          <p className="text-gray-500 font-medium mb-8">
            Thank you for your order. A confirmation email is on its way, and we're preparing your items for delivery.
          </p>

          {transactionRef && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 w-full flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Transaction Reference</span>
              <span className="text-sm font-mono font-black text-gray-900 break-all bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">{transactionRef}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to="/orders"
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:-translate-y-0.5 transition-all shadow-lg flex justify-center items-center"
            >
              Track My Order
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-blue-50 text-blue-700 border border-blue-100 py-4 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex justify-center items-center gap-2 group"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* ── PENDING (payment received, still finalizing) ──────────── */}
      {status === 'pending' && (
        <div className={`${card} animate-in zoom-in-95 duration-500`}>
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-100">
            <Clock size={46} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Processing</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">
            We've received your payment and are finalizing your order. This can take a few minutes for bank transfers.
            <span className="block mt-2 text-gray-400">You'll get a confirmation email the moment it's complete — you can safely close this page.</span>
          </p>

          {transactionRef && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 w-full flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Transaction Reference</span>
              <span className="text-sm font-mono font-black text-gray-900 break-all bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">{transactionRef}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to="/orders"
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:-translate-y-0.5 transition-all shadow-lg flex justify-center items-center gap-2"
            >
              <PackageSearch size={16} /> Check Order Status
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-blue-50 text-blue-700 border border-blue-100 py-4 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* ── FAILED / CANCELLED ────────────────────────────────────── */}
      {status === 'failed' && (
        <div className={`${card} animate-in shake duration-500`}>
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <ShieldAlert size={48} className="text-red-500" />
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            {wasCancelled ? 'Payment Cancelled' : 'Payment Not Completed'}
          </h2>
          <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">
            {wasCancelled
              ? 'No charge was made. Your order is saved — you can complete payment whenever you\'re ready.'
              : 'We couldn\'t complete your payment. Your items are still saved. If you were charged, it will be reversed automatically.'}
          </p>

          {retryError && (
            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-3 mb-5 text-xs font-semibold text-red-600">
              {retryError}
            </div>
          )}

          <div className="flex flex-col gap-3 w-full mb-6">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {retrying
                ? <><Loader2 size={16} className="animate-spin" /> Starting…</>
                : <>{wasCancelled ? 'Complete Payment' : 'Try Again'} <ArrowRight size={16} /></>}
            </button>
            <Link
              to="/cart"
              className="w-full bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200 flex justify-center items-center gap-2"
            >
              <RefreshCw size={15} /> Back to Cart
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/orders" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
              View my orders
            </Link>
            <span className="text-gray-200">•</span>
            <Link to="/products" className="text-xs font-bold text-gray-400 hover:text-gray-900 inline-flex items-center gap-1 transition-colors">
              <ArrowLeft size={12} /> Return to store
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;