import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Star, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';

const getDisplayImages = (product) => {
  const fallback = "https://placehold.co/600x800?text=No+Image";
  if (!product.images || product.images.length === 0) {
    return { primary: fallback, secondary: null };
  }
  const primaryImg   = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImg = product.images.find((img) => img.url !== primaryImg.url) || null;
  return {
    primary:   primaryImg.url,
    secondary: secondaryImg ? secondaryImg.url : null,
  };
};

const ProductCard = ({ product, isFlashSale }) => {
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding]     = useState(false);
  const [wished,   setWished]       = useState(false);
  const [imgError, setImgError]     = useState(false);

  const productId = product.id;
  const price     = product.price || product.basePrice || 0;
  const stock     = product.stockQuantity !== undefined ? product.stockQuantity : (product.totalStock || 0);
  const isSoldOut = stock <= 0;

  const handleCartAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) { toast.error("This item is currently sold out."); return; }
    setIsAdding(true);
    try {
      const response    = await api.get(`/products/${productId}`);
      const fullProduct = response.data.product || response.data;
      const hasOptions        = fullProduct.variantOptions && fullProduct.variantOptions.length > 0;
      const hasMultipleVariants = fullProduct.variants && fullProduct.variants.length > 1;
      if (hasOptions || hasMultipleVariants) { navigate(`/product/${productId}`); return; }
      let targetVariantId = productId;
      if (fullProduct.variants && fullProduct.variants.length === 1) {
        targetVariantId = fullProduct.variants[0].id;
      }
      await addToCart(targetVariantId, 1);
    } catch {
      navigate(`/product/${productId}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWished((p) => !p);
  };

  const { primary, secondary } = getDisplayImages(product);

  return (
    <Link
      to={`/product/${productId}`}
      className="group flex flex-col cursor-pointer relative bg-white rounded-xl sm:rounded-2xl overflow-hidden
                 border border-gray-100/80
                 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] hover:border-green-100
                 transition-all duration-300"
    >
      {/* ─── IMAGE ───────────────────────────────────────────────────────── */}
      <div className="relative bg-gray-50 overflow-hidden aspect-[3/4] isolate">

        {/* Primary image */}
        <img
          src={imgError ? "https://placehold.co/600x800?text=No+Image" : primary}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform
            ${isSoldOut ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
        />

        {/* Secondary crossfade — desktop hover only */}
        {!isSoldOut && secondary && (
          <img
            src={secondary}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover
                       transition-opacity duration-500 ease-in-out
                       opacity-0 group-hover:opacity-100"
          />
        )}

        {/* Dark gradient — helps badges + button legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* ── WISHLIST pill (top-right) */}
        <button
          onClick={handleWish}
          aria-label="Save to wishlist"
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-md shadow-sm border transition-all
            ${wished
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white/70 border-white/50 text-gray-500 hover:bg-white hover:text-red-500'
            }`}
        >
          <Heart size={13} fill={wished ? 'currentColor' : 'none'} />
        </button>

        {/* ── BADGES (top-left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {isSoldOut ? (
            <span className="bg-gray-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
              Sold Out
            </span>
          ) : (
            <>
              {product.discount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  -{product.discount}%
                </span>
              )}
              {isFlashSale && (
                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  ⚡ Flash
                </span>
              )}
            </>
          )}
        </div>

        {/* ── QUICK ADD
              Desktop: slides up on hover (pointer device)
              Mobile:  always visible as a compact icon pill at bottom
        */}
        {!isSoldOut && (
          <>
            {/* Desktop hover button */}
            <div className="hidden sm:block absolute bottom-2.5 left-2.5 right-2.5
                            translate-y-3 opacity-0
                            group-hover:translate-y-0 group-hover:opacity-100
                            transition-all duration-300 z-20">
              <button
                onClick={handleCartAction}
                disabled={isAdding}
                className="w-full bg-white/85 backdrop-blur-md border border-white/60
                           text-gray-900 font-bold py-2.5 rounded-xl shadow-lg
                           flex items-center justify-center gap-2 text-xs
                           hover:bg-green-600 hover:text-white hover:border-green-600
                           transition-all disabled:opacity-60"
              >
                {isAdding ? <Loader2 size={14} className="animate-spin" /> : <><ShoppingCart size={14} /> Quick Add</>}
              </button>
            </div>

            {/* Mobile persistent icon button — bottom-right corner */}
            <button
              onClick={handleCartAction}
              disabled={isAdding}
              aria-label="Add to cart"
              className="sm:hidden absolute bottom-2 right-2 z-20
                         w-8 h-8 bg-white rounded-full shadow-md border border-gray-100
                         flex items-center justify-center text-gray-700
                         active:scale-95 active:bg-green-600 active:text-white active:border-green-600
                         transition-all disabled:opacity-60"
            >
              {isAdding
                ? <Loader2 size={13} className="animate-spin text-green-600" />
                : <ShoppingCart size={13} />
              }
            </button>
          </>
        )}
      </div>

      {/* ─── TEXT INFO ───────────────────────────────────────────────────── */}
      {/*
          Mobile: compact — p-2 with tighter text
          Desktop: p-3/p-4 with standard sizing
      */}
      <div className="flex flex-col flex-1 p-2 sm:p-3">

        {/* Brand / category */}
        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate mb-0.5 sm:mb-1">
          {product.brandName || product.categoryName || "Premium"}
        </p>

        {/* Product name */}
        <h3 className="text-gray-900 font-semibold text-[11px] sm:text-sm leading-snug mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="mt-auto flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
          <p className="text-gray-900 font-black text-sm sm:text-base tracking-tight">
            ₦{price.toLocaleString()}
          </p>
          {product.discount > 0 && (
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 line-through">
              ₦{(price / (1 - product.discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>

        {/* Rating — only if present */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-0.5 mt-1">
            <Star size={9} className="text-orange-400 fill-orange-400" />
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;