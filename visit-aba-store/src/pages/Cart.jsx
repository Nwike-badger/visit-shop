import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Helper to safely extract attributes
  const getAttributes = (item) => item.attributes || item.variantAttributes || {};

  return (
    <main className="bg-gray-50/30 min-h-screen pb-24 font-sans selection:bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest mb-4 transition-colors">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                  Shopping Bag 
                  {cartItems?.length > 0 && (
                    <span className="text-gray-400 font-medium text-2xl ml-3">({cartItems.length})</span>
                  )}
              </h1>
            </div>
            
            {cartItems?.length > 0 && (
              <button 
                onClick={clearCart} 
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors py-2"
              >
                  Empty Bag
              </button>
            )}
        </div>

        {(!cartItems || cartItems.length === 0) ? (
          /* ─── EMPTY STATE ──────────────────────────────────────────────── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Your bag is empty</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
              Looks like you haven't added anything to your cart yet. Discover our latest arrivals and premium selections.
            </p>
            <Link 
              to="/products" 
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* ─── FILLED STATE ─────────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT: Item List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item, index) => {
                const attrs = getAttributes(item);
                const hasAttrs = Object.keys(attrs).length > 0;
                
                return (
                  <div 
                    key={`${item.variantId}-${index}`} 
                    className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-6 group transition-all hover:shadow-md"
                  >
                    
                    {/* Image */}
                    <Link to={`/product/${item.productId}`} className="w-24 h-28 sm:w-32 sm:h-36 bg-gray-50 rounded-2xl shrink-0 overflow-hidden relative">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100"><ShoppingBag size={24} className="text-gray-300" /></div>
                        )}
                    </Link>
                    
                    {/* Details Container */}
                    <div className="flex flex-col flex-1 justify-between">
                        {/* Top Row: Title & Delete */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{item.brandName || "Exclusive"}</p>
                                <Link to={`/product/${item.productId}`} className="text-base sm:text-lg font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors line-clamp-2">
                                    {item.productName}
                                </Link>
                                
                                {/* Attributes (Sizes, Colors) */}
                                {hasAttrs && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                      {Object.entries(attrs).map(([key, value]) => (
                                          <span key={key} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                                              <span className="text-gray-400 mr-1">{key}:</span> {value}
                                          </span>
                                      ))}
                                  </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => removeFromCart(item.variantId)} 
                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                                title="Remove item"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Bottom Row: Price & Quantity */}
                        <div className="flex items-end justify-between mt-4 sm:mt-6">
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200/60 p-1">
                                <button 
                                    onClick={() => updateQuantity && updateQuantity(item.variantId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-lg shadow-sm hover:text-blue-600 disabled:opacity-40 disabled:hover:text-gray-600 disabled:shadow-none transition-all"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity && updateQuantity(item.variantId, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-lg shadow-sm hover:text-blue-600 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                {item.quantity > 1 && (
                                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                                    ₦{(item.unitPrice || 0).toLocaleString()} each
                                  </p>
                                )}
                                <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                                  ₦{(item.subTotal || (item.unitPrice * item.quantity) || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
                <h2 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 text-sm font-medium text-gray-600 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated Shipping</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">₦{cartTotal.toLocaleString()}</span>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                >
                  Checkout Securely <ArrowRight size={16} />
                </button>

                <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500" /> 100% Secure Checkout</div>
                  <p className="font-medium text-[10px] uppercase tracking-widest">We accept Visa, Mastercard, Verve, and bank transfers</p>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;