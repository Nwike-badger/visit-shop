import React, { useState, useEffect, useMemo } from 'react';
import { Star, StarHalf, Minus, Plus, ShoppingBag, CheckCircle, AlertTriangle, Info, PackageX } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Stars = ({ rating = 0, count = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < full ? <Star size={13} fill="#f59e0b" stroke="#f59e0b" /> : i === full && half ? <StarHalf size={13} fill="#f59e0b" stroke="#f59e0b" /> : <Star size={13} fill="none" stroke="#d1d5db" />}
          </span>
        ))}
      </div>
      {count > 0 && <span className="text-[11px] text-gray-400 font-medium">({count} reviews)</span>}
    </div>
  );
};

const ProductInfo = ({ product }) => {
  const { addToCart } = useCart();

  const [activeVariant, setActiveVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState('idle'); // idle | loading | success | error

  // Only consider ACTIVE variants
  const activeVariants = useMemo(
    () => (product.variants || []).filter(v => v.active !== false),
    [product.variants]
  );

  const hasVariants = activeVariants.length > 0;

  // ── Auto-select the first available variant on load ──
  useEffect(() => {
    if (hasVariants && !activeVariant) {
      // Try to auto-select one that is in stock, otherwise just pick the first one
      const inStock = activeVariants.find(v => v.stockQuantity > 0);
      setActiveVariant(inStock || activeVariants[0]);
    }
  }, [hasVariants, activeVariants, activeVariant]);

  // Reset quantity when switching variants
  useEffect(() => {
    setQuantity(1);
  }, [activeVariant]);

  // ── Derived display values ──
  const displayPrice = activeVariant ? activeVariant.price : (product.minPrice || product.price || product.basePrice || 0);
  const displayComparePrice = activeVariant ? activeVariant.compareAtPrice : product.originalPrice;
  const currentStock = activeVariant ? (activeVariant.stockQuantity || 0) : (!hasVariants ? (product.totalStock || product.stockQuantity || 0) : 0);
  const onSale = activeVariant?.activeCampaignId || product.activeCampaignId;

  // ── Stock status logic ──
  const stockStatus = useMemo(() => {
    if (currentStock === 0) return { label: 'Out of Stock', color: '#ef4444', barWidth: '0%', show: true };
    if (currentStock <= 3)  return { label: `Only ${currentStock} left!`, color: '#ef4444', barWidth: '12%', show: true };
    if (currentStock <= 10) return { label: `${currentStock} left in stock`, color: '#f59e0b', barWidth: `${(currentStock / 20) * 100}%`, show: true };
    if (currentStock <= 20) return { label: `${currentStock} units available`, color: '#22c55e', barWidth: `${(currentStock / 30) * 100}%`, show: true };
    return { label: 'In Stock', color: '#22c55e', barWidth: '100%', show: false };
  }, [currentStock]);

  const handleAddToCart = async () => {
    const variantId = activeVariant?.id || product.id;

    if (!variantId) {
      alert('Error: Cannot add to cart. Product ID is missing.');
      return;
    }

    setCartState('loading');
    // Pass the exact attributes of the clicked box to the cart for rendering on the checkout page
    const attributes = activeVariant ? activeVariant.attributes : {};
    const success = await addToCart(variantId, quantity, attributes);
    
    if (success) {
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2500);
    } else {
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2000);
    }
  };

  const isOutOfStock = currentStock === 0;
  const canAddToCart = !isOutOfStock && (hasVariants ? activeVariant !== null : true);

  return (
    <div className="space-y-7 font-sans">

      {/* ── Header ── */}
      <div className="space-y-3">
        {product.brandName && (
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{product.brandName}</p>
        )}
        <h1 className="text-[1.6rem] font-black text-gray-900 leading-tight tracking-tight">{product.name}</h1>
        <div className="flex items-center flex-wrap gap-3">
          <Stars rating={product.averageRating || 0} count={product.reviewCount || 0} />
          {onSale && (
            <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
              On Sale
            </span>
          )}
        </div>
      </div>

      {/* ── Main Price Display ── */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-end gap-3 flex-wrap">
          <span key={displayPrice} className="text-[2.2rem] font-black text-gray-900 tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ₦{Number(displayPrice || 0).toLocaleString()}
          </span>
          {displayComparePrice > displayPrice && (
            <span className="text-lg text-gray-400 line-through mb-0.5">
              ₦{Number(displayComparePrice).toLocaleString()}
            </span>
          )}
          {displayComparePrice > displayPrice && (
            <span className="mb-0.5 bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider">
              {Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)}% off
            </span>
          )}
        </div>
      </div>

      {/* ── Stock Warning Bar ── */}
      {stockStatus.show && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-widest ${
              currentStock === 0 ? 'text-red-500' : currentStock <= 3 ? 'text-red-500' : currentStock <= 10 ? 'text-amber-600' : 'text-green-600'
            }`}>
              {currentStock === 0 ? '⚠ Out of Stock' : `⚡ ${stockStatus.label}`}
            </span>
          </div>
          {currentStock > 0 && (
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: stockStatus.barWidth, backgroundColor: stockStatus.color }} />
            </div>
          )}
        </div>
      )}

      {/* 🔥 DISCRETE VARIANT SELECTOR (The Enterprise Upgrade) ── */}
      {hasVariants && (
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
             Available Models
          </span>
          <div className="grid grid-cols-1 gap-3">
            {activeVariants.map((v) => {
              const isSelected = activeVariant?.id === v.id;
              const isVariantOOS = v.stockQuantity === 0;
              
              // Map attributes {Color: "Black", Storage: "128GB"} -> "Black • 128GB"
              const label = Object.values(v.attributes || {}).join(' • ') || v.sku;

              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v)}
                  className={`
                    flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left
                    ${isSelected ? 'border-gray-900 bg-gray-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}
                    ${isVariantOOS && !isSelected ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex flex-col pr-4">
                    <span className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                       {label}
                    </span>
                    {isVariantOOS && (
                      <span className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                         <PackageX size={12}/> Out of Stock
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`font-black tracking-tight ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      ₦{Number(v.price).toLocaleString()}
                    </span>
                    {v.compareAtPrice > v.price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₦{Number(v.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quantity + Add to Cart ── */}
      <div className="space-y-3 pt-5 border-t border-gray-100">
        <div className="flex gap-3">
          <div className={`flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden ${!canAddToCart ? 'opacity-40 pointer-events-none' : ''}`}>
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3.5 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-black text-sm text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="px-3.5 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || cartState === 'loading'}
            className={`
              flex-1 font-black text-sm uppercase tracking-widest rounded-xl py-4
              flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]
              ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : cartState === 'loading' ? 'bg-gray-700 text-white cursor-wait'
                : cartState === 'success' ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : cartState === 'error' ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 hover:bg-black hover:-translate-y-0.5'}
            `}
          >
            {isOutOfStock ? 'Out of Stock' 
             : cartState === 'loading' ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Adding…</>
             : cartState === 'success' ? <><CheckCircle size={17} /> Added to Bag</>
             : cartState === 'error' ? 'Failed — try again'
             : <><ShoppingBag size={17} /> Add to Bag</>}
          </button>
        </div>

        {canAddToCart && quantity >= currentStock && (
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={11} /> Maximum available quantity selected
          </p>
        )}
      </div>

      {/* ── Description ── */}
      {product.description && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* ── Specs ── */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} className="flex flex-col border-b border-gray-50 pb-1">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{k}</span>
                <span className="text-sm font-bold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;