import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center font-sans px-4">
        <ShoppingBag size={48} strokeWidth={1} className="text-gray-300 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Shopping Bag</h2>
        <p className="text-gray-500 mb-8 text-sm">Your bag is currently empty.</p>
        <Link 
          to="/" 
          className="bg-gray-900 text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 font-sans selection:bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Minimalist Header */}
        <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-widest">
                Shopping Bag <span className="text-gray-400 font-medium text-lg ml-2">({cartItems.length})</span>
            </h1>
            <button 
              onClick={clearCart} 
              className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-red-500 transition-colors"
            >
                Empty Bag
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT: Item List */}
          <div className="lg:col-span-8">
            {/* Table Header (Desktop only) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4 mb-6">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-8">
                {cartItems.map((item, index) => (
                  <div key={`${item.variantId}-${index}`} className="group grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-4 items-center border-b border-gray-100 pb-8 last:border-0">
                    
                    {/* Image & Details */}
                    <div className="sm:col-span-6 flex gap-6">
                        <Link to={`/product/${item.productId}`} className="w-24 h-32 bg-gray-50 shrink-0 block">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover object-top" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100"><ShoppingBag size={24} className="text-gray-300" /></div>
                            )}
                        </Link>
                        
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.brandName || "Exclusive"}</p>
                            <Link to={`/product/${item.productId}`} className="text-sm font-bold text-gray-900 mb-2 hover:underline">
                                {item.productName}
                            </Link>
                            
                            
{(() => {
    // Look for either name convention from your backend
    const attrs = item.attributes || item.variantAttributes;
    
    if (attrs && Object.keys(attrs).length > 0) {
        return (
            <div className="space-y-1 mt-1">
                {Object.entries(attrs).map(([key, value]) => (
                    <p key={key} className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{key}:</span> {value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
})()}
                            
                            <p className="text-xs text-gray-500 mt-2 sm:hidden">₦{(item.unitPrice || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="sm:col-span-3 flex sm:justify-center items-center gap-4">
                        <span className="text-xs text-gray-500 sm:hidden">Qty:</span>
                        <div className="flex items-center border border-gray-200">
                            {/* Note: Ensure updateQuantity exists in CartContext, otherwise fallback to read-only quantity */}
                            <button 
                                onClick={() => updateQuantity && updateQuantity(item.variantId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity && updateQuantity(item.variantId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.variantId)} 
                            className="text-gray-300 hover:text-red-500 transition-colors p-2 sm:hidden"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Price & Remove (Desktop) */}
                    <div className="sm:col-span-3 flex justify-between sm:justify-end items-center gap-4">
                        <span className="text-sm font-black text-gray-900">₦{(item.subTotal || (item.unitPrice * item.quantity) || 0).toLocaleString()}</span>
                        <button 
                            onClick={() => removeFromCart(item.variantId)} 
                            className="hidden sm:block text-gray-300 hover:text-red-500 transition-colors"
                            title="Remove item"
                        >
                            <X size={18} />
                        </button>
                    </div>

                  </div>
                ))}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 sticky top-28">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-xs text-gray-500">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-end">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-gray-900">₦{cartTotal.toLocaleString()}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-gray-900 text-white uppercase tracking-widest text-xs font-bold py-4 hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </button>

              <div className="mt-6 flex flex-col items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-gray-700" /> Secure Checkout</div>
                <p>We accept Visa, Mastercard, and Verve.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Cart;