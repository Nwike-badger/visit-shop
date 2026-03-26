import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';

const getDisplayImages = (product) => {
  const fallback = "https://placehold.co/600x800?text=No+Image";
  if (!product.images || product.images.length === 0) {
    return { primary: fallback, secondary: null };
  }
  
  const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
  const secondaryImg = product.images.find(img => img.url !== primaryImg.url) || null;
  
  return { 
    primary: primaryImg.url, 
    secondary: secondaryImg ? secondaryImg.url : null 
  };
};

const ProductCard = ({ product, isFlashSale }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = product.id; 
  const price = product.price || product.basePrice || 0;
  const stock = product.stockQuantity !== undefined ? product.stockQuantity : (product.totalStock || 0);
  const isSoldOut = stock <= 0;

  const handleCartAction = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (isSoldOut) {
        toast.error("This item is currently sold out.");
        return;
    }

    setIsAdding(true);
    try {
        const response = await api.get(`/products/${productId}`); 
        const fullProduct = response.data.product || response.data; // Handle your ProductDetailResponse wrapper
        
        const hasOptions = fullProduct.variantOptions && fullProduct.variantOptions.length > 0;
        const hasMultipleVariants = fullProduct.variants && fullProduct.variants.length > 1;

        if (hasOptions || hasMultipleVariants) {
            navigate(`/product/${productId}`);
            return; 
        }

        let targetVariantId = productId;
        if (fullProduct.variants && fullProduct.variants.length === 1) {
            targetVariantId = fullProduct.variants[0].id;
        }

        const success = await addToCart(targetVariantId, 1);
        // Toast is handled inside the CartContext now, so we don't duplicate it here!
        
    } catch (error) {
        console.error("Cart action failed:", error);
        navigate(`/product/${productId}`);
    } finally {
        setIsAdding(false);
    }
  };

  const { primary, secondary } = getDisplayImages(product);

  return (
    <Link 
      to={`/product/${productId}`} 
      className="group flex flex-col cursor-pointer relative bg-white border border-gray-100/80 rounded-2xl p-3 sm:p-4 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all duration-300"
    >
      {/* 1. IMAGE CONTAINER */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-[4/5] mb-4 isolate">
         
         <img 
           src={primary} 
           alt={product.name} 
           loading="lazy"
           className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform ${isSoldOut ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
         />
         
         {/* Secondary Image Crossfade */}
         {!isSoldOut && secondary && (
             <img 
               src={secondary} 
               alt={`${product.name} alternate view`} 
               loading="lazy"
               className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
             />
         )}
         
         {/* GLASSMORPHISM ACTION BUTTON */}
         {!isSoldOut && (
             <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button 
                  onClick={handleCartAction}
                  disabled={isAdding}
                  className="w-full bg-white/80 backdrop-blur-md border border-white/50 text-gray-900 font-bold py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                      <Loader2 size={16} className="animate-spin" />
                  ) : (
                      <><ShoppingCart size={16} /> Quick Add</>
                  )}
                </button>
             </div>
         )}

         {/* BADGES */}
         <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
             {isSoldOut ? (
                <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase tracking-widest">
                    Sold Out
                </span>
             ) : (
                <>
                  {product.discount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase tracking-widest">
                          -{product.discount}%
                      </span>
                  )}
                  {isFlashSale && (
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-1">
                          ⚡ Flash
                      </span>
                  )}
                </>
             )}
         </div>
      </div>

      {/* 2. TEXT DETAILS */}
      <div className="px-1 flex flex-col flex-1">
         {/* Meta Data Row */}
         <div className="flex items-center justify-between mb-1.5">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[70%]">
                 {product.brandName || product.categoryName || "Premium"}
             </p>
             {/* Optional Rating Display */}
             {product.averageRating > 0 && (
               <div className="flex items-center gap-0.5 text-orange-400">
                 <Star size={10} fill="currentColor" />
                 <span className="text-[10px] font-bold text-gray-600">{product.averageRating.toFixed(1)}</span>
               </div>
             )}
         </div>

         {/* Product Title */}
         <h3 className="text-gray-900 font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
             {product.name}
         </h3>
         
         {/* Pricing Layout */}
         <div className="mt-auto flex items-end flex-wrap gap-2">
             <p className="text-gray-900 font-black text-base sm:text-lg tracking-tight">
                 ₦{price.toLocaleString()}
             </p>
             {product.discount > 0 && (
                 <p className="text-xs font-medium text-gray-400 line-through mb-0.5">
                     ₦{(price / (1 - product.discount / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                 </p>
             )}
         </div>
      </div>
    </Link>
  );
};

export default ProductCard;