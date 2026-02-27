import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { MapPin, ShieldCheck, CreditCard } from 'lucide-react'; // Added some nice icons

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Address State
  const [address, setAddress] = useState({
    streetAddress: '', city: '', state: '', postalCode: '', country: 'Nigeria'
  });
  
  // Track if they are using a pre-saved address
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  // 1. Check Auth & Fetch User Data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Fetch user profile to see if they already have an address
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/v1/users/me');
        const userProfile = response.data;
        
        if (userProfile.defaultAddress) {
          setAddress(userProfile.defaultAddress);
          setHasSavedAddress(true);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserProfile();
  }, [navigate, location]);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  // 🚀 PLACE ORDER 
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderRequest = {
        items: cartItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
        })),
        shippingAddress: address,
        billingAddress: address,
        paymentMethod: "BANK_TRANSFER" 
    };

    try {
        const response = await api.post('/v1/orders', orderRequest);
        const order = response.data;
        
        alert(`Order #${order.orderNumber} Placed Successfully! Status: ${order.orderStatus}`);
        clearCart();
        navigate('/'); 

    } catch (error) {
        console.error("Order failed", error);
        alert(error.response?.data?.message || "Order creation failed.");
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

  if (fetchingUser) return <div className="p-20 text-center text-gray-500 font-bold animate-pulse">Loading secure checkout...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          
          <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
             <ShieldCheck size={32} className="text-green-600" />
             <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Shipping Details */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
               <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                       <MapPin className="text-blue-600" size={24}/> Delivery Address
                   </h2>
                   
                   {/* 🌟 SMART UI: Show saved address card if it exists, else show form */}
                   {hasSavedAddress ? (
                       <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl relative">
                           <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Default</span>
                           <p className="font-bold text-gray-900 mb-2">Delivering to:</p>
                           <p className="text-gray-700">{address.streetAddress}</p>
                           <p className="text-gray-700">{address.city}, {address.state}</p>
                           <p className="text-gray-700">{address.country}</p>
                           
                           <button 
                             type="button" 
                             onClick={() => setHasSavedAddress(false)} 
                             className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 underline"
                           >
                             Deliver to a different address
                           </button>
                       </div>
                   ) : (
                       <form id="checkout-form" className="space-y-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                              <input name="streetAddress" value={address.streetAddress} placeholder="e.g. 12 Awolowo Way" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" onChange={handleChange} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                  <input name="city" value={address.city} placeholder="Ikeja" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all" onChange={handleChange} />
                              </div>
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                                  <input name="state" value={address.state} placeholder="Lagos" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all" onChange={handleChange} />
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code (Optional)</label>
                                  <input name="postalCode" value={address.postalCode} placeholder="100001" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all" onChange={handleChange} />
                              </div>
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                                  <input name="country" value="Nigeria" disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                              </div>
                          </div>
                       </form>
                   )}
               </div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                   <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
                   
                   <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {cartItems.map(item => (
                          <div key={item.variantId} className="flex justify-between items-start gap-4">
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

                   {/* Submit Button attaches to the form via the 'form' attribute, even if using saved address */}
                   <button 
                     type="button" 
                     onClick={handlePlaceOrder} 
                     disabled={loading || (!hasSavedAddress && !address.streetAddress)}
                     className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2
                        ${loading || (!hasSavedAddress && !address.streetAddress) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:-translate-y-1'}
                     `}
                   >
                     {loading ? 'Processing...' : <><CreditCard size={20}/> Confirm Order</>}
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