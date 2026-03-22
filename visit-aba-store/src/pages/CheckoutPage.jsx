import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { MapPin, ShieldCheck, CreditCard, ShoppingCart, UserCheck, Loader2 } from 'lucide-react';
import AddressForm from '../components/AddressForm';

const CheckoutPage = () => {
  const { cartItems, cartTotal, refreshCart } = useCart();
  const { user, isAuthenticated, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [address, setAddress] = useState({ streetAddress: '', city: '', state: '', phoneNumber: '', country: 'Nigeria' });
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.defaultAddress) {
      setAddress(user.defaultAddress);
      setHasSavedAddress(true);
    }
  }, [isAuthenticated, user]);

  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');
    try {
      const res = await api.post('/v1/auth/google', { token: credentialResponse.credential, guestId });
      await login(res.data.accessToken);
      localStorage.removeItem('guest_cart_id');
      refreshCart();
      toast.success("Logged in with Google! Let's complete your order.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInlineAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');
    try {
      if (authMode === 'login') {
        const res = await api.post('/v1/auth/login', { username: authForm.email, password: authForm.password, guestId });
        await login(res.data.accessToken);
        toast.success("Logged in! Let's complete your order.");
      } else {
        await api.post('/v1/auth/register', authForm);
        const res = await api.post('/v1/auth/login', { username: authForm.email, password: authForm.password, guestId });
        await login(res.data.accessToken);
        toast.success("Account created! Let's complete your order.");
      }
      localStorage.removeItem('guest_cart_id');
      refreshCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
  e.preventDefault();
  setLoading(true);

  // ── Guard: catch stale cart items before hitting the backend ──────────────
  // If any cart item has no variantId, the order will 409 immediately.
  // This catches the "seeder restarted and recreated IDs" case early
  // with a clear user-facing message.
  const invalidItems = cartItems.filter(item => !item.variantId);
  if (invalidItems.length > 0) {
    toast.error(
      'Some items in your cart are no longer available. Please remove them and re-add the products.',
      { duration: 6000 }
    );
    setLoading(false);
    return;
  }

  const orderRequest = {
    items: cartItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
    shippingAddress: address,
    billingAddress: address,
    paymentMethod: 'MONNIFY',
  };

  try {
    console.log('[Checkout] Step 1: Creating order...');
    const orderRes = await api.post('/v1/orders', orderRequest);
    const order = orderRes.data;
    console.log('[Checkout] Step 1 done. orderId =', order.orderId, '| orderNumber =', order.orderNumber);

    if (!order?.orderId) {
      throw new Error(`Order was created but no orderId returned. Response: ${JSON.stringify(order)}`);
    }

    console.log('[Checkout] Step 2: Initializing payment for orderId =', order.orderId);
    const paymentRes = await api.post(`/v1/payments/init/${order.orderId}`);
    console.log('[Checkout] Step 2 done. checkoutUrl =', paymentRes.data?.checkoutUrl);

    const checkoutUrl = paymentRes.data?.checkoutUrl;
    if (!checkoutUrl) {
      throw new Error(`No checkout URL returned. Response: ${JSON.stringify(paymentRes.data)}`);
    }

    console.log('[Checkout] Step 3: Redirecting to Monnify...');
    window.location.href = checkoutUrl;

  } catch (error) {
    // ── Specific handling for known 409 causes ────────────────────────────
    if (error.response?.status === 409) {
      const serverMessage = error.response?.data?.message || '';

      if (serverMessage.includes('variant') || serverMessage.includes('not found')) {
        // Stale cart — IDs changed after server restart or product deletion
        toast.error(
          'Some items in your cart are outdated. Please go back to the cart, remove all items, and re-add them.',
          { duration: 8000 }
        );
      } else {
        // Other conflict (e.g. out of stock discovered at order time)
        toast.error(serverMessage || 'Could not place order. Please check your cart.');
      }
    } else {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to initialize checkout. Please try again.';
      toast.error(message);
    }

    console.error('[Checkout] FAILED:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    setLoading(false);
  }
};

  const isAddressValid = hasSavedAddress || (
    address.streetAddress?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.phoneNumber?.trim()
  );

  if (cartItems.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <ShoppingCart size={48} className="text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">
        Continue Shopping
      </button>
    </div>
  );

  if (authLoading) return (
    <div className="p-20 text-center animate-pulse">Securing checkout...</div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">

        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
          <ShieldCheck size={32} className="text-green-600" />
          <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Left: Auth + Address ──────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {!isAuthenticated ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Sign in or create an account to secure your order.</p>
                </div>
                <div className="mb-6 flex justify-center max-w-md">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed')}
                    useOneTap shape="rectangular" size="large" text="continue_with" width="100%"
                  />
                </div>
                <div className="relative flex items-center mb-6 max-w-md">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR USE EMAIL</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
                  <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Log In</button>
                  <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'signup' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Sign Up</button>
                </div>
                <form onSubmit={handleInlineAuth} className="space-y-4 max-w-md">
                  {authMode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                        <input required name="firstName" onChange={handleAuthChange} disabled={loading} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                        <input required name="lastName" onChange={handleAuthChange} disabled={loading} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input required type="email" name="email" onChange={handleAuthChange} disabled={loading} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <input required type="password" name="password" minLength={6} onChange={handleAuthChange} disabled={loading} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <button disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold mt-2 hover:bg-black transition-all disabled:opacity-50">
                    {loading ? 'Processing...' : authMode === 'login' ? 'Continue to Shipping' : 'Create Account & Continue'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 bg-green-50 text-green-800 p-4 rounded-xl mb-8 border border-green-100">
                  <UserCheck size={20} className="text-green-600" />
                  <span className="text-sm font-medium">Logged in as <span className="font-bold">{user?.email}</span></span>
                </div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <MapPin className="text-blue-600" size={24} /> Delivery Address
                </h2>
                {hasSavedAddress ? (
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl relative">
                    <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Default</span>
                    <p className="font-bold text-gray-900 mb-2">Delivering to:</p>
                    <p className="text-gray-700 text-sm font-medium mb-1">{address.phoneNumber}</p>
                    <p className="text-gray-700">{address.streetAddress}</p>
                    <p className="text-gray-700">{address.city}, {address.state}</p>
                    <button type="button" onClick={() => setHasSavedAddress(false)} className="mt-5 text-sm font-bold text-gray-500 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg bg-white">
                      Change delivery address
                    </button>
                  </div>
                ) : (
                  <AddressForm address={address} setAddress={setAddress} loading={loading} />
                )}
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ──────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, index) => (
                  <div key={`${item.variantId}-${index}`} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      ₦{Number(item.subTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-4 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
              </div>
              <div className="border-t border-gray-900 pt-4 mb-8 flex justify-between items-end">
                <span className="text-gray-900 font-bold">Total to Pay</span>
                <span className="text-3xl font-black text-blue-600">₦{cartTotal.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || !isAuthenticated || !isAddressValid}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2
                  ${loading || !isAuthenticated || !isAddressValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:-translate-y-1'}
                `}
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Redirecting to payment...</>
                ) : !isAuthenticated ? (
                  'Sign In to Proceed'
                ) : (
                  <><CreditCard size={20} /> Pay Securely via Monnify</>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <ShieldCheck size={14} /> Encrypted & Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;