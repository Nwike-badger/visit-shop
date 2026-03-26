import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { MapPin, ShieldCheck, CreditCard, ShoppingBag, UserCheck, Loader2, Lock, ArrowLeft } from 'lucide-react';
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
        toast.success("Welcome back! Let's complete your order.");
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
      const orderRes = await api.post('/v1/orders', orderRequest);
      const order = orderRes.data;

      if (!order?.orderId) {
        throw new Error(`Order was created but no orderId returned.`);
      }

      const paymentRes = await api.post(`/v1/payments/init/${order.orderId}`);
      const checkoutUrl = paymentRes.data?.checkoutUrl;
      
      if (!checkoutUrl) {
        throw new Error(`No checkout URL returned.`);
      }

      window.location.href = checkoutUrl;

    } catch (error) {
      if (error.response?.status === 409) {
        const serverMessage = error.response?.data?.message || '';
        if (serverMessage.includes('variant') || serverMessage.includes('not found')) {
          toast.error('Some items in your cart are outdated. Please go back, remove them, and re-add.', { duration: 8000 });
        } else {
          toast.error(serverMessage || 'Could not place order. Please check your cart.');
        }
      } else {
        const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to initialize checkout.';
        toast.error(message);
      }
      setLoading(false);
    }
  };

  const isAddressValid = hasSavedAddress || (
    address.streetAddress?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.phoneNumber?.trim()
  );

  // ── 1. Empty State ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) return (
    <div className="bg-gray-50/30 min-h-screen flex flex-col items-center justify-center text-center px-4 font-sans">
      <div className="bg-white p-12 sm:p-20 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-lg w-full">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 font-medium mb-8">You need items in your cart to proceed to checkout.</p>
        <button onClick={() => navigate('/')} className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
          Return to Store
        </button>
      </div>
    </div>
  );

  // ── 2. Loading State ────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Securing Checkout...</p>
      </div>
    </div>
  );

  // ── 3. Main Checkout View ───────────────────────────────────────────────────
  return (
    <main className="bg-gray-50/30 min-h-screen pb-24 font-sans selection:bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10 border-b border-gray-100 pb-6">
          <div>
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Cart
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
               Secure Checkout <Lock size={28} className="text-gray-300" />
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT COLUMN: Auth & Address ─────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {!isAuthenticated ? (
              /* Auth Block */
              <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="mb-8 border-b border-gray-100 pb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Account Details</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Sign in or create an account to secure your order.</p>
                </div>
                
                <div className="max-w-md">
                  <div className="mb-8">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google login failed')}
                      useOneTap shape="rectangular" size="large" text="continue_with" width="100%"
                    />
                  </div>
                  
                  <div className="relative flex items-center mb-8">
                    <div className="flex-grow border-t border-gray-100" />
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">OR CONTINUE WITH EMAIL</span>
                    <div className="flex-grow border-t border-gray-100" />
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8">
                    <button 
                      type="button"
                      onClick={() => setAuthMode('login')} 
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Log In
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('signup')} 
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form onSubmit={handleInlineAuth} className="space-y-5">
                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1.5">First Name</label>
                          <input required name="firstName" onChange={handleAuthChange} disabled={loading} className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1.5">Last Name</label>
                          <input required name="lastName" onChange={handleAuthChange} disabled={loading} className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Email Address</label>
                      <input required type="email" name="email" onChange={handleAuthChange} disabled={loading} className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Password</label>
                      <input required type="password" name="password" minLength={6} onChange={handleAuthChange} disabled={loading} className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900" />
                    </div>
                    
                    <button disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Authenticating...' : authMode === 'login' ? 'Log In to Continue' : 'Create Account & Continue'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Address Block */
              <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                       Delivery Address
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
                      <UserCheck size={16} className="text-green-500" /> Logged in as <span className="text-gray-900 font-bold">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {hasSavedAddress ? (
                  <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 relative group">
                    <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                       <MapPin size={18} />
                    </div>
                    <p className="font-black text-gray-900 text-lg mb-2">Delivery Destination</p>
                    <div className="space-y-1 text-gray-600 font-medium mb-6">
                      <p className="text-gray-900 font-bold">{address.phoneNumber}</p>
                      <p className="pt-2">{address.streetAddress}</p>
                      <p>{address.city}, {address.state}</p>
                    </div>
                    <button type="button" onClick={() => setHasSavedAddress(false)} className="text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                      Use a different address
                    </button>
                  </div>
                ) : (
                  <AddressForm address={address} setAddress={setAddress} loading={loading} />
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Order Summary ─────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-28">
              <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight border-b border-gray-100 pb-4">Order Summary</h2>
              
              {/* Receipt Items */}
              <div className="space-y-5 mb-6 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={`${item.variantId}-${index}`} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{item.productName}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-gray-900 whitespace-nowrap">
                      ₦{Number(item.subTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Receipt Totals */}
              <div className="space-y-4 border-t border-gray-100 pt-6 mb-6 text-sm font-medium text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-black uppercase tracking-widest">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-900 pt-6 mb-8 flex justify-between items-end">
                <span className="text-gray-900 font-bold uppercase tracking-widest text-sm">Total to Pay</span>
                <span className="text-3xl font-black text-gray-900 tracking-tight">₦{cartTotal.toLocaleString()}</span>
              </div>
              
              {/* The Grand Conversion Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || !isAuthenticated || !isAddressValid}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2
                  ${(loading || !isAuthenticated || !isAddressValid)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'}
                `}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : !isAuthenticated ? (
                  'Sign In to Proceed'
                ) : !isAddressValid ? (
                  'Complete Address'
                ) : (
                  <><CreditCard size={18} /> Pay Securely</>
                )}
              </button>
              
              {/* Trust Badges */}
              <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-bold text-gray-400">
                 <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500" /> 100% Encrypted Payment via Monnify</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;