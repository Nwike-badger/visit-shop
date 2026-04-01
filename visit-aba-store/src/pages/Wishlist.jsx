import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <main className="bg-gray-50/30 min-h-screen pb-24 font-sans selection:bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* ─── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest mb-4 transition-colors">
                <ArrowLeft size={14} /> Back to Store
              </Link>
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                  Saved Items 
                  {wishlistItems?.length > 0 && (
                    <span className="text-gray-400 font-medium text-2xl ml-3">({wishlistItems.length})</span>
                  )}
              </h1>
            </div>
            
            {wishlistItems?.length > 0 && (
              <button 
                onClick={clearWishlist} 
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors py-2 flex items-center gap-1.5"
              >
                  <Trash2 size={14} /> Clear All
              </button>
            )}
        </div>

        {(!wishlistItems || wishlistItems.length === 0) ? (
          /* ─── EMPTY STATE ──────────────────────────────────────────────── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-300 mb-6 border border-red-100">
              <Heart size={40} className="fill-current text-red-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Nothing saved yet</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
              Keep track of items you love by clicking the heart icon on any product. They'll wait for you here.
            </p>
            <Link 
              to="/products" 
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
            >
              Explore Products <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* ─── FILLED STATE (GRID) ──────────────────────────────────────── */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <div 
                key={item.productId} 
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:shadow-md transition-shadow relative"
              >
                {/* Remove Button (Absolute Top Right) */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.productId);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                  title="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>

                {/* Image */}
                <Link to={`/product/${item.productId}`} className="aspect-[4/5] bg-gray-50 relative overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.productName} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                  )}
                </Link>
                
                {/* Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                    {item.brandName || "Exclusive"}
                  </p>
                  <Link 
                    to={`/product/${item.productId}`} 
                    className="text-sm font-bold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2 mb-2"
                  >
                    {item.productName}
                  </Link>

                  {/* Pricing */}
                  <div className="mt-auto mb-4">
                    <span className="text-base font-black text-gray-900 tracking-tight">
                      ₦{(item.currentPrice || 0).toLocaleString()}
                    </span>
                    {item.compareAtPrice && item.compareAtPrice > item.currentPrice && (
                      <span className="text-xs text-gray-400 line-through ml-2 font-medium">
                        ₦{item.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action Button: Routes to PDP to select variants */}
                  <Link 
                    to={`/product/${item.productId}`} 
                    className="w-full py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-900 text-gray-900 hover:text-white border border-gray-200 hover:border-gray-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={14} /> View Options
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;