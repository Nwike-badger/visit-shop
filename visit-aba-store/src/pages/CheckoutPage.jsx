import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { MapPin, ShieldCheck, CreditCard, ShoppingCart, UserCheck, UserPlus } from 'lucide-react';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart, refreshCart } = useCart();
  const { user, isAuthenticated, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Form States
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [address, setAddress] = useState({ streetAddress: '', city: '', state: '', postalCode: '', country: 'Nigeria' });
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  // Address pre-fill effect (only runs when authenticated)
  useEffect(() => {
    if (isAuthenticated && user?.defaultAddress) {
        setAddress(user.defaultAddress);
        setHasSavedAddress(true);
    }
  }, [isAuthenticated, user]);

  // Handlers
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  // 🚀 INLINE AUTHENTICATION
  const handleInlineAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const guestId = localStorage.getItem('guest_cart_id');

    try {
      if (authMode === 'login') {
        const res = await api.post('/v1/auth/login', { username: authForm.email, password: authForm.password, guestId });
        await login(res.data.accessToken);
        toast.success("Logged in successfully! Let's complete your order.");
      } else {
        // Signup
        await api.post('/v1/auth/register', authForm);
        // Auto-login after signup
        const res = await api.post('/v1/auth/login', { username: authForm.email, password: authForm.password, guestId });
        await login(res.data.accessToken);
        toast.success("Account created! Let's complete your order.");
      }
      
      localStorage.removeItem('guest_cart_id');
      refreshCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 PLACE ORDER 
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderRequest = {
        items: cartItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        shippingAddress: address,
        billingAddress: address,
        paymentMethod: "BANK_TRANSFER" 
    };

    try {
        const response = await api.post('/v1/orders', orderRequest);
        toast.success(`Order #${response.data.orderNumber} Placed Successfully!`);
        clearCart();
        navigate('/orders'); 
    } catch (error) {
        toast.error(error.response?.data?.message || "Order creation failed.");
    } finally {
        setLoading(false);
    }
  };

  if (cartItems.length === 0) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <ShoppingCart size={48} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">Continue Shopping</button>
      </div>
  );

  if (authLoading) return <div className="p-20 text-center animate-pulse">Securing checkout...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          
          <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
             <ShieldCheck size={32} className="text-green-600" />
             <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Dynamic Flow (Auth -> Shipping) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
               
               {!isAuthenticated ? (
                   // --- STEP 1: INLINE AUTHENTICATION ---
                   <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                       <div className="mb-6 border-b border-gray-100 pb-4">
                           <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                           <p className="text-sm text-gray-500 mt-1">Sign in or create an account to secure your order.</p>
                       </div>

                       {/* Toggle Login/Signup */}
                       <div className="flex bg-gray-100 p-1 rounded-lg mb-6 max-w-sm">
                           <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Log In</button>
                           <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'signup' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Sign Up</button>
                       </div>

                       <form onSubmit={handleInlineAuth} className="space-y-4 max-w-md">
                           {authMode === 'signup' && (
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                                       <input required name="firstName" onChange={handleAuthChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                                       <input required name="lastName" onChange={handleAuthChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                                   </div>
                               </div>
                           )}
                           <div>
                               <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                               <input required type="email" name="email" onChange={handleAuthChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                               <input required type="password" name="password" minLength={6} onChange={handleAuthChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                           </div>
                           
                           <button disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold mt-2 hover:bg-black transition-all">
                               {loading ? 'Processing...' : authMode === 'login' ? 'Continue to Shipping' : 'Create Account & Continue'}
                           </button>
                       </form>
                   </div>
               ) : (
                   // --- STEP 2: SHIPPING ADDRESS (Shows only after auth) ---
                   <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       
                       {/* Contextual Auth Success Banner */}
                       <div className="flex items-center gap-3 bg-green-50 text-green-800 p-4 rounded-xl mb-8 border border-green-100">
                           <UserCheck size={20} className="text-green-600"/>
                           <span className="text-sm font-medium">Logged in as <span className="font-bold">{user?.email}</span></span>
                       </div>

                       <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                           <MapPin className="text-blue-600" size={24}/> Delivery Address
                       </h2>
                       
                       {hasSavedAddress ? (
                           <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl relative">
                               <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Default</span>
                               <p className="font-bold text-gray-900 mb-2">Delivering to:</p>
                               <p className="text-gray-700">{address.streetAddress}</p>
                               <p className="text-gray-700">{address.city}, {address.state}</p>
                               <button type="button" onClick={() => setHasSavedAddress(false)} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 underline">
                                 Deliver to a different address
                               </button>
                           </div>
                       ) : (
                           <form id="checkout-form" className="space-y-4">
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                                  <input name="streetAddress" value={address.streetAddress} placeholder="e.g. 12 Awolowo Way" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" onChange={handleAddressChange} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                      <input name="city" value={address.city} placeholder="Ikeja" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" onChange={handleAddressChange} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                                      <input name="state" value={address.state} placeholder="Lagos" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" onChange={handleAddressChange} />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code (Optional)</label>
                                      <input name="postalCode" value={address.postalCode} placeholder="100001" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" onChange={handleAddressChange} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                                      <input name="country" value="Nigeria" disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500" />
                                  </div>
                              </div>
                           </form>
                       )}
                   </div>
               )}
            </div>

            {/* RIGHT COLUMN: Order Summary (Always Visible!) */}
            <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                   <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
                   
                   <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {cartItems.map((item, index) => (
                          <div key={`${item.variantId}-${index}`} className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-900 leading-tight">{item.productName}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                              <span className="font-bold text-gray-900 whitespace-nowrap">₦{item.subTotal.toLocaleString()}</span>
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

                   {/* SMART BUTTON: Only active if logged in AND address is ready */}
                   <button 
                     type="button" 
                     onClick={handlePlaceOrder} 
                     disabled={loading || !isAuthenticated || (!hasSavedAddress && !address.streetAddress)}
                     className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2
                        ${loading || !isAuthenticated || (!hasSavedAddress && !address.streetAddress) 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                            : 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:-translate-y-1'}
                     `}
                   >
                     {loading ? 'Processing...' : !isAuthenticated ? 'Sign In to Proceed' : <><CreditCard size={20}/> Confirm Order</>}
                   </button>
                   
                   <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                       <ShieldCheck size={14}/> Encrypted & Secure Checkout
                   </div>
                </div>
            </div>

          </div>
        </div>
    </div>
  );
};

export default CheckoutPage;