import React, { useState, useEffect, useMemo } from 'react';
import { Star, StarHalf, Minus, Plus, ShoppingBag, CheckCircle, AlertTriangle, Heart, Share2, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../../context/CartContext';

// ─────────────────────────────────────────────────────────────
// COLOR INTELLIGENCE: maps common color names → CSS values.
// Covers English + pidgin/Nigerian market names.
// Falls back to a CSS color lookup, then null (renders pill instead).
// ─────────────────────────────────────────────────────────────
const COLOR_MAP = {
  // Basics
  black: '#0a0a0a', white: '#ffffff', red: '#ef4444', blue: '#3b82f6',
  green: '#22c55e', yellow: '#facc15', orange: '#f97316', purple: '#a855f7',
  pink: '#ec4899', brown: '#92400e', grey: '#9ca3af', gray: '#9ca3af',
  beige: '#d4b896', cream: '#fffdd0', ivory: '#fffff0', tan: '#d2b48c',
  navy: '#1e3a5f', maroon: '#800000', burgundy: '#800020', wine: '#722f37',
  coral: '#ff6b6b', salmon: '#fa8072', peach: '#ffcba4', mint: '#98ff98',
  teal: '#14b8a6', cyan: '#06b6d4', indigo: '#6366f1', violet: '#8b5cf6',
  lavender: '#e6e6fa', lilac: '#c8a2c8', magenta: '#ff00ff', fuchsia: '#d946ef',
  gold: '#fbbf24', silver: '#94a3b8', bronze: '#cd7f32', copper: '#b87333',
  // Shades
  'off-white': '#faf9f6', 'off white': '#faf9f6', 'sky blue': '#87ceeb',
  'baby blue': '#89cff0', 'royal blue': '#4169e1', 'light blue': '#add8e6',
  'dark blue': '#00008b', 'light green': '#90ee90', 'dark green': '#006400',
  'olive green': '#6b8e23', olive: '#808000', 'forest green': '#228b22',
  khaki: '#c3b091', camel: '#c19a6b', mustard: '#e1ad01', lemon: '#fff44f',
  lime: '#84cc16', 'rose gold': '#b76e79', nude: '#e8c5a0', blush: '#f4c2c2',
  charcoal: '#36454f', slate: '#708090', 'ash grey': '#b2beb5', ash: '#b2beb5',
  denim: '#1560bd', 'cherry red': '#dc143c', scarlet: '#ff2400', crimson: '#dc143c',
  emerald: '#50c878', turquoise: '#40e0d0', aqua: '#00ffff', cobalt: '#0047ab',
  // Common fashion market names in Nigeria
  chocolate: '#7b3f00', mocha: '#967969', coffee: '#6f4e37', 'off-black': '#0d0d0d',
  multicolor: 'linear-gradient(135deg,#f43f5e,#f97316,#facc15,#4ade80,#3b82f6,#a855f7)',
  multi: 'linear-gradient(135deg,#f43f5e,#f97316,#facc15,#4ade80,#3b82f6,#a855f7)',
  pattern: 'repeating-linear-gradient(45deg,#e5e7eb 0,#e5e7eb 4px,#fff 0,#fff 8px)',
  print:   'repeating-linear-gradient(45deg,#fde68a 0,#fde68a 4px,#fff 0,#fff 8px)',
};

/**
 * Resolves a color name string to a CSS value.
 * Returns null if the name is NOT a color attribute.
 */
const resolveColor = (value) => {
  const key = value.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  // Try CSS itself — create a temp element and check computed color
  try {
    const el = document.createElement('div');
    el.style.color = key;
    document.body.appendChild(el);
    const computed = window.getComputedStyle(el).color;
    document.body.removeChild(el);
    if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== '') return key;
  } catch { /* noop */ }
  return null;
};

/** Checks if an attribute name looks like a color field */
const isColorAttribute = (name) =>
  /colou?r|shade|hue|tint|finish/i.test(name);

/** For light colors, the swatch checkmark needs to be dark */
const isDark = (cssColor) => {
  if (!cssColor || cssColor.includes('gradient')) return false;
  try {
    const c = cssColor.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  } catch { return false; }
};

// ─────────────────────────────────────────────────────────────
// STARS
// ─────────────────────────────────────────────────────────────
const Stars = ({ rating = 0, count = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < full
              ? <Star  size={13} fill="#f59e0b" stroke="#f59e0b" />
              : i === full && half
                ? <StarHalf size={13} fill="#f59e0b" stroke="#f59e0b" />
                : <Star size={13} fill="none" stroke="#d1d5db" />}
          </span>
        ))}
      </div>
      {count > 0 && <span className="text-[11px] text-gray-400 font-medium">({count} reviews)</span>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COLOR SWATCH BUTTON
// ─────────────────────────────────────────────────────────────
const ColorSwatch = ({ value, isSelected, isUnavailable, onClick }) => {
  const cssColor = resolveColor(value);
  const bg = cssColor || '#e5e7eb';
  const dark = isDark(bg);
  const isGradient = bg.includes('gradient');

  return (
    <button
      onClick={onClick}
      disabled={isUnavailable}
      title={value}
      className={`
        relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 flex items-center justify-center
        ${isSelected
          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
          : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105'}
        ${isUnavailable ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{ background: bg }}
    >
      {/* Diagonal strike for unavailable */}
      {isUnavailable && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-1/2 left-[-10%] right-[-10%] h-[1.5px] bg-gray-400/80 rotate-45 origin-center" />
        </div>
      )}
      {/* Checkmark when selected */}
      {isSelected && !isUnavailable && (
        <CheckCircle
          size={14}
          className={dark || isGradient ? 'text-white drop-shadow-sm' : 'text-gray-900'}
          strokeWidth={2.5}
        />
      )}
      {/* White border for white swatches */}
      {(value.toLowerCase().trim() === 'white' || value.toLowerCase().trim() === 'ivory' || value.toLowerCase().trim() === 'cream') && (
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-gray-200" />
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// PILL / TEXT VARIANT BUTTON  (size, material, etc.)
// ─────────────────────────────────────────────────────────────
const VariantPill = ({ value, isSelected, isUnavailable, onClick }) => (
  <button
    onClick={onClick}
    disabled={isUnavailable}
    className={`
      relative px-3.5 py-2 text-[11px] sm:text-xs font-bold rounded-xl border-2 transition-all duration-200 tracking-wide
      ${isSelected
        ? 'border-gray-900 bg-gray-900 text-white shadow-md'
        : isUnavailable
          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through decoration-gray-300'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'}
    `}
  >
    {value}
    {isUnavailable && !isSelected && (
      <span className="absolute inset-0 rounded-xl overflow-hidden">
        <span className="absolute top-1/2 left-[-5%] right-[-5%] h-[1px] bg-gray-300 rotate-[-8deg] origin-center block" />
      </span>
    )}
  </button>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const ProductInfo = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity]   = useState(1);
  const [cartState, setCartState] = useState('idle');
  const [wished, setWished]       = useState(false);

  const activeVariants = useMemo(
    () => (product.variants || []).filter((v) => v.active !== false),
    [product.variants]
  );

  const hasRealVariants = useMemo(
    () => activeVariants.some((v) => v.attributes && Object.keys(v.attributes).length > 0),
    [activeVariants]
  );

  // Unique attributes from all active variants
  const availableAttributes = useMemo(() => {
    if (!hasRealVariants) return {};
    const attrs = {};
    activeVariants.forEach((v) => {
      if (!v.attributes) return;
      Object.entries(v.attributes).forEach(([k, val]) => {
        if (!attrs[k]) attrs[k] = new Set();
        attrs[k].add(val);
      });
    });
    const result = {};
    Object.keys(attrs).forEach((k) => { result[k] = Array.from(attrs[k]); });
    return result;
  }, [activeVariants, hasRealVariants]);

  // Currently matched variant
  const activeVariant = useMemo(() => {
    if (!hasRealVariants) return activeVariants[0] || null;
    if (Object.keys(selectedOptions).length === 0) return null;
    return activeVariants.find((v) =>
      Object.entries(selectedOptions).every(([k, val]) => v.attributes?.[k] === val)
    ) || null;
  }, [selectedOptions, activeVariants, hasRealVariants]);

  // Which options are available given current partial selections?
  const getAvailableOptionsForAttribute = (attributeName) => {
    const otherSelections = Object.fromEntries(
      Object.entries(selectedOptions).filter(([k]) => k !== attributeName)
    );
    const hasOther = Object.keys(otherSelections).length > 0;
    return (availableAttributes[attributeName] || []).reduce((acc, option) => {
      const testSelections = { ...otherSelections, [attributeName]: option };
      const match = activeVariants.find((v) =>
        Object.entries(testSelections).every(([k, val]) => v.attributes?.[k] === val)
      );
      acc[option] = {
        available: !hasOther || !!match,
        stock: match?.stockQuantity ?? 0,
      };
      return acc;
    }, {});
  };

  // Auto-select first in-stock variant
  useEffect(() => {
    if (hasRealVariants && Object.keys(selectedOptions).length === 0) {
      const inStock = activeVariants.find((v) => v.stockQuantity > 0) || activeVariants[0];
      if (inStock?.attributes) setSelectedOptions(inStock.attributes);
    }
  }, [hasRealVariants, activeVariants]);

  useEffect(() => { setQuantity(1); }, [selectedOptions]);

  const handleOptionSelect = (attributeName, value) => {
    const newSelections = { ...selectedOptions, [attributeName]: value };
    const exact = activeVariants.some((v) =>
      Object.entries(newSelections).every(([k, val]) => v.attributes?.[k] === val)
    );
    if (exact) {
      setSelectedOptions(newSelections);
    } else {
      const fallback = activeVariants.find((v) => v.attributes?.[attributeName] === value);
      if (fallback?.attributes) setSelectedOptions(fallback.attributes);
    }
  };

  const displayPrice        = activeVariant ? activeVariant.price       : (product.minPrice || product.price || product.basePrice || 0);
  const displayComparePrice = activeVariant ? activeVariant.compareAtPrice : product.originalPrice;
  const currentStock        = activeVariant ? (activeVariant.stockQuantity || 0) : (product.totalStock || product.stockQuantity || 0);
  const onSale              = activeVariant?.activeCampaignId || product.activeCampaignId;
  const discountPct         = displayComparePrice > displayPrice
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
    : 0;

  const stockStatus = useMemo(() => {
    if (currentStock === 0)  return { label: 'Out of Stock',              color: '#ef4444', width: '0%',                         show: true  };
    if (currentStock <= 3)   return { label: `Only ${currentStock} left!`, color: '#ef4444', width: '12%',                        show: true  };
    if (currentStock <= 10)  return { label: `${currentStock} left`,       color: '#f59e0b', width: `${(currentStock / 20) * 100}%`, show: true  };
    if (currentStock <= 20)  return { label: `${currentStock} available`,  color: '#22c55e', width: `${(currentStock / 30) * 100}%`, show: true  };
    return                          { label: 'In Stock',                   color: '#22c55e', width: '100%',                       show: false };
  }, [currentStock]);

  const handleAddToCart = async () => {
    const variantId = activeVariant?.id || product.id;
    if (!variantId) return;
    setCartState('loading');
    const success = await addToCart(variantId, quantity, activeVariant?.attributes || {});
    if (success) {
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2500);
    } else {
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2000);
    }
  };

  const isOutOfStock  = currentStock === 0;
  const canAddToCart  = !isOutOfStock && (hasRealVariants ? activeVariant !== null : true);

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">

      {/* ── HEADER ── */}
      <div className="space-y-2.5">
        {product.brandName && (
          <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">
            {product.brandName}
          </p>
        )}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl sm:text-[1.65rem] font-black text-gray-900 leading-tight tracking-tight flex-1">
            {product.name}
          </h1>
          {/* Wishlist + Share — top right */}
          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            <button
              onClick={() => setWished((p) => !p)}
              aria-label="Save to wishlist"
              className={`p-2 rounded-full border transition-all
                ${wished
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'}`}
            >
              <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              aria-label="Share product"
              className="p-2 rounded-full border bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Stars rating={product.averageRating || 0} count={product.reviewCount || 0} />
          {onSale && (
            <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* ── PRICE ── */}
      <div className="flex items-end gap-3 flex-wrap py-3 border-y border-gray-100">
        <span className="text-[2rem] sm:text-[2.2rem] font-black text-gray-900 tracking-tight leading-none"
              style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₦{Number(displayPrice || 0).toLocaleString()}
        </span>
        {displayComparePrice > displayPrice && (
          <>
            <span className="text-base text-gray-400 line-through mb-0.5">
              ₦{Number(displayComparePrice).toLocaleString()}
            </span>
            <span className="mb-0.5 bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
              {discountPct}% off
            </span>
          </>
        )}
      </div>

      {/* ── STOCK BAR ── */}
      {stockStatus.show && (
        <div className="space-y-1.5">
          <span className={`text-[11px] font-bold uppercase tracking-widest ${
            currentStock === 0 ? 'text-red-500'
              : currentStock <= 3 ? 'text-red-500'
              : currentStock <= 10 ? 'text-amber-600'
              : 'text-green-600'
          }`}>
            {currentStock === 0 ? '⚠ Out of Stock' : `⚡ ${stockStatus.label}`}
          </span>
          {currentStock > 0 && (
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: stockStatus.width, backgroundColor: stockStatus.color }} />
            </div>
          )}
        </div>
      )}

      {/* ── VARIANT SELECTORS ── */}
      {hasRealVariants && Object.keys(availableAttributes).length > 0 && (
        <div className="space-y-5 pt-1">
          {Object.entries(availableAttributes).map(([attributeName, options]) => {
            const isColor    = isColorAttribute(attributeName);
            const optionMeta = getAvailableOptionsForAttribute(attributeName);

            return (
              <div key={attributeName} className="space-y-3">
                {/* Attribute label row */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {attributeName}:
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {selectedOptions[attributeName] || '—'}
                  </span>
                  {/* Low stock warning for current color/size */}
                  {activeVariant && activeVariant.stockQuantity > 0 && activeVariant.stockQuantity <= 5 && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-auto">
                      only {activeVariant.stockQuantity} left
                    </span>
                  )}
                </div>

                {/* Swatches or Pills */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {options.map((option) => {
                    const isSelected    = selectedOptions[attributeName] === option;
                    const isUnavailable = !optionMeta[option]?.available;

                    return isColor ? (
                      <ColorSwatch
                        key={option}
                        value={option}
                        isSelected={isSelected}
                        isUnavailable={isUnavailable}
                        onClick={() => !isUnavailable && handleOptionSelect(attributeName, option)}
                      />
                    ) : (
                      <VariantPill
                        key={option}
                        value={option}
                        isSelected={isSelected}
                        isUnavailable={isUnavailable}
                        onClick={() => !isUnavailable && handleOptionSelect(attributeName, option)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── QUANTITY + ADD TO CART ── */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-2.5 sm:gap-3">

          {/* Quantity stepper */}
          <div className={`flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shrink-0
                           ${!canAddToCart ? 'opacity-40 pointer-events-none' : ''}`}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3 sm:px-3.5 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 sm:w-10 text-center font-black text-sm text-gray-900 tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="px-3 sm:px-3.5 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || cartState === 'loading'}
            className={`
              flex-1 font-black text-[11px] sm:text-sm uppercase tracking-widest rounded-xl py-3.5 sm:py-4
              flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]
              ${isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : cartState === 'loading' ? 'bg-gray-700 text-white cursor-wait'
                : cartState === 'success' ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : cartState === 'error'   ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 hover:bg-black hover:-translate-y-0.5'}
            `}
          >
            {isOutOfStock                 ? 'Out of Stock'
              : cartState === 'loading'   ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Adding…</>
              : cartState === 'success'   ? <><CheckCircle size={17} /> Added to Bag</>
              : cartState === 'error'     ? 'Failed — try again'
              : <><ShoppingBag size={17} /> Add to Bag</>}
          </button>
        </div>

        {canAddToCart && quantity >= currentStock && currentStock > 0 && (
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={11} /> Maximum available quantity selected
          </p>
        )}
      </div>

      {/* ── TRUST PILLS ── */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {[
          { icon: Truck,     text: 'Nationwide Delivery' },
          { icon: RotateCcw, text: 'Easy Returns'        },
        ].map(({ icon: Icon, text }) => (
          <div key={text}
               className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Icon size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">{text}</span>
          </div>
        ))}
      </div>

      {/* ── DESCRIPTION ── */}
      {product.description && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* ── SPECS ── */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} className="flex flex-col border-b border-gray-50 pb-1.5">
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