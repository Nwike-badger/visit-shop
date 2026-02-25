import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    streetAddress: '', city: '', state: '', postalCode: '', country: 'Nigeria'
  });

  // 1. Check Authentication on Mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to Login, but remember to come back here!
      navigate('/login', { state: { from: location } });
    }
  }, [navigate, location]);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  // 🚀 PLACE ORDER (Current Phase: No Payment Integration)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare Request
    const orderRequest = {
        // Backend extracts customer details from JWT token
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
        
        // --- ⬇️ PAYMENT INTEGRATION POINT ⬇️ ---
        // Currently: We assume order is PENDING_PAYMENT and successful
        // Future: 
        // 1. Get `paymentLink` from response.data (e.g., Paystack URL)
        // 2. window.location.href = response.data.paymentLink;
        // 3. Return here not via navigate, but via Webhook/Callback
        // ----------------------------------------

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

  if (cartItems.length === 0) return <div className="p-20 text-center text-xl">Your cart is empty.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Address Form */}
        <div>
           <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
           <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <input name="streetAddress" placeholder="Street Address" required className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 ring-blue-100" onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                  <input name="city" placeholder="City" required className="p-3 border rounded-lg bg-gray-50" onChange={handleChange} />
                  <input name="state" placeholder="State" required className="p-3 border rounded-lg bg-gray-50" onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <input name="postalCode" placeholder="Postal Code" className="p-3 border rounded-lg bg-gray-50" onChange={handleChange} />
                  <input name="country" value="Nigeria" disabled className="p-3 border rounded-lg bg-gray-100 text-gray-500" />
              </div>
           </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-2xl h-fit border border-gray-200">
           <h2 className="text-lg font-semibold mb-4">Summary</h2>
           <div className="space-y-2 mb-6">
              {cartItems.map(item => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="font-medium">₦{item.subTotal.toLocaleString()}</span>
                  </div>
              ))}
           </div>
           
           <div className="border-t pt-4 flex justify-between text-xl font-black">
              <span>Total To Pay</span>
              <span>₦{cartTotal.toLocaleString()}</span>
           </div>

           <button 
             type="submit" form="checkout-form" disabled={loading}
             className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all
                ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
             `}
           >
             {loading ? 'Processing Order...' : 'Confirm Order'}
           </button>
           <p className="text-xs text-center text-gray-400 mt-3">Secure Encrypted Transaction</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;