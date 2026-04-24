import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Star, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { thumbUrl, makeSrcSet } from '../../utils/imageUtils';

// ─── Fallback ─────────────────────────────────────────────────────────────────
const FALLBACK = 'https://placehold.co/400x533?text=No+Image';

// ─── Image URL extractor — applies CDN optimisation ──────────────────────────
const getDisplayImages = (product) => {
  if (!product.images || product.images.length === 0) {
    return { primary: FALLBACK, secondary: null, primaryRaw: null };
  }
  const primaryImg   = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImg = product.images.find((img) => img.url !== primaryImg.url) || null;
  return {
    primary:    thumbUrl(primaryImg.url),
    primaryRaw: primaryImg.url,                                    // needed for srcSet
    secondary:  secondaryImg ? thumbUrl(secondaryImg.url) : null,
    secondaryRaw: secondaryImg?.url ?? null,
  };
};

// ─── ProductCard ──────────────────────────────────────────────────────────────
/**
 * Props
 *   product      — product object from the API
 *   isFlashSale  — shows the ⚡ Flash badge
 *   priority     — true for the first ~5 cards visible above the fold;
 *                  disables lazy-loading so they appear instantly.
 *                  ProductGrid passes this automatically for index < 5.
 */
const ProductCard = ({ product, isFlashSale, priority = false }) => {
  const navigate       = useNavigate();
  const { addToCart }  = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isAdding,     setIsAdding]     = useState(false);
  const [imgError,     setImgError]     = useState(false);
  const [isWishLoading, setIsWishLoading] = useState(false);

  const productId = product.id;
  const price     = product.price || product.minPrice || product.basePrice || 0;
  const stock     = product.stockQuantity !== undefined
    ? product.stockQuantity
    : (product.totalStock || 0);
  const isSoldOut = stock <= 0;
  const isWished  = isInWishlist(productId);

  // ── Quick-add ────────────────────────────────────────────────────────────
  const handleCartAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) { toast.error('This item is currently sold out.'); return; }
    setIsAdding(true);
    try {
      const response   = await api.get(`/products/${productId}`);
      const fullProduct = response.data.product || response.data;
      const hasOptions  = fullProduct.variantOptions?.length > 0;
      const hasMulti    = fullProduct.variants?.length > 1;

      if (hasOptions || hasMulti) { navigate(`/product/${productId}`); return; }

      const targetVariantId = fullProduct.variants?.length === 1
        ? fullProduct.variants[0].id
        : productId;

      await addToCart(targetVariantId, 1);
    } catch {
      navigate(`/product/${productId}`);
    } finally {
      setIsAdding(false);
    }
  };

  // ── Wishlist ─────────────────────────────────────────────────────────────
  const handleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishLoading) return;
    setIsWishLoading(true);
    await toggleWishlist(productId);
    setIsWishLoading(false);
  };

  const { primary, primaryRaw, secondary, secondaryRaw } = getDisplayImages(product);

  // ── Loading strategy: eager (priority) vs lazy ───────────────────────────
  //    Cards above the fold get fetchpriority="high" + no lazy loading.
  //    Everything else defers until the browser is idle.
  const loadingAttr   = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high'  : 'low';

  // Responsive sizes hint:
  //   - 2-col mobile  → each card ~50vw
  //   - 3-col sm      → ~33vw
  //   - 4-col md      → ~25vw
  //   - 5-col lg      → 20vw (capped at 320px in very wide viewports)
  const sizesAttr = '(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, 20vw';

  return (
    <Link
      to={`/product/${productId}`}
      className="group flex flex-col cursor-pointer relative bg-white rounded-xl sm:rounded-2xl overflow-hidden
                 border border-gray-100/80
                 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] hover:border-green-100
                 transition-all duration-300"
    >
      {/* ── IMAGE ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gray-100 overflow-hidden aspect-[3/4] isolate">

        {/* Primary */}
        <img
          src={imgError ? FALLBACK : primary}
          srcSet={!imgError && primaryRaw ? makeSrcSet(primaryRaw) : undefined}
          sizes={sizesAttr}
          alt={product.name}
          loading={loadingAttr}
          fetchpriority={fetchPriority}
          decoding="async"
          width={400}
          height={533}
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform
            ${isSoldOut ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
        />

        {/* Secondary crossfade — only loaded when hovered (CSS opacity trick) */}
        {!isSoldOut && secondary && (
          <img
            src={secondary}
            srcSet={secondaryRaw ? makeSrcSet(secondaryRaw) : undefined}
            sizes={sizesAttr}
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
            className="absolute inset-0 w-full h-full object-cover
                       transition-opacity duration-500 ease-in-out
                       opacity-0 group-hover:opacity-100"
          />
        )}

        {/* Bottom gradient for text legibility over image */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* ── Wishlist pill ── */}
        <button
          onClick={handleWish}
          disabled={isWishLoading}
          aria-label={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-md shadow-sm border transition-all
            ${isWished
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white/70 border-white/50 text-gray-500 hover:bg-white hover:text-red-500'
            }
            ${isWishLoading ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {isWishLoading
            ? <Loader2 size={13} className="animate-spin text-current" />
            : <Heart size={13} fill={isWished ? 'currentColor' : 'none'} />
          }
        </button>

        {/* ── Badges ── */}
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

        {/* ── Quick-add: desktop hover button ── */}
        {!isSoldOut && (
          <>
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
                {isAdding
                  ? <Loader2 size={14} className="animate-spin" />
                  : <><ShoppingCart size={14} /> Add to Cart</>
                }
              </button>
            </div>

            {/* Quick-add: mobile FAB */}
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

      {/* ── TEXT INFO ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-2 sm:p-3">
        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate mb-0.5 sm:mb-1">
          {product.brandName || product.categoryName || 'Premium'}
        </p>

        <h3 className="text-gray-900 font-semibold text-[11px] sm:text-sm leading-snug mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
          <p className="text-gray-900 font-black text-sm sm:text-base tracking-tight">
            ₦{price.toLocaleString()}
          </p>
          {product.discount > 0 && product.compareAtPrice && (
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 line-through">
              ₦{product.compareAtPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>

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