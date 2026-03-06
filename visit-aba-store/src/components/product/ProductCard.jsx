import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';

const getDisplayImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return "https://placehold.co/600x800";
  }
  const primary = product.images.find((img) => img.isPrimary);
  return primary ? primary.url : product.images[0].url;
};

const getSecondaryImage = (product) => {
  if (!product.images || product.images.length < 2) {
    return getDisplayImage(product);
  }
  const secondary = product.images.find((img) => !img.isPrimary);
  return secondary ? secondary.url : product.images[1].url;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = product.id; 
  const price = product.price || product.basePrice || 0;
  const stock = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 0);

  const handleCartAction = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (stock === 0) {
        toast.error("This item is currently sold out.");
        return;
    }

    setIsAdding(true);
    try {
        // 1. Fetch the FULL product data silently to get the real truth
        const response = await api.get(`/products/${productId}`); 
        const fullProduct = response.data;
        
        // 2. THE ULTIMATE CHECK: Does it actually have multiple sizes/options?
        const hasRealOptions = fullProduct.variantOptions && Object.keys(fullProduct.variantOptions).length > 0;
        const hasMultipleVariants = fullProduct.variants && fullProduct.variants.length > 1;

        if (hasRealOptions || hasMultipleVariants) {
            // 🛑 HALT! It's a clothing item with sizes. 
            // Do not auto-add. Send them to the details page to choose!
            navigate(`/product/${productId}`);
            return; // Exit early
        }

        // 3. It truly is a single-variant item (like the Felicity Inverter or Bag)
        let targetVariantId = null;
        if (fullProduct.variants && fullProduct.variants.length > 0) {
            targetVariantId = fullProduct.variants[0].id || fullProduct.variants[0].sku;
        } else {
            targetVariantId = productId; // Failsafe
        }

        if (!targetVariantId) {
            navigate(`/product/${productId}`);
            return;
        }

        // 4. THE FIX: Safely add the single item to cart using exact arguments!
        // CartContext expects (variantId, quantity)
        await addToCart(targetVariantId, 1);
        
        toast.success(`${product.name} added to cart!`);
        
    } catch (error) {
        console.error("Silent fetch failed:", error);
        // If the silent fetch fails, don't crash, just take them to the details page
        navigate(`/product/${productId}`);
    } finally {
        setIsAdding(false);
    }
  };

  const primaryImage = getDisplayImage(product);
  const secondaryImage = getSecondaryImage(product); 

  return (
    <Link to={`/product/${productId}`} className="group block cursor-pointer relative bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
      
      {/* 1. IMAGE CONTAINER */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-[4/5] mb-4">
         
         <img 
           src={primaryImage} 
           alt={product.name} 
           className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out ${stock === 0 ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
         />
         
         {stock > 0 && product.images?.length > 1 && (
             <img 
               src={secondaryImage} 
               alt={`${product.name} alternate`} 
               className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110"
             />
         )}
         
         {/* THE ACTION BUTTON */}
         {stock > 0 && (
             <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <button 
                  onClick={handleCartAction}
                  disabled={isAdding}
                  className="w-full bg-white/95 backdrop-blur-md text-gray-900 font-bold py-2.5 rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-colors text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                      <Loader2 size={16} className="animate-spin" />
                  ) : (
                      <><ShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
             </div>
         )}

         {/* Out of Stock Overlay */}
         {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
                <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Sold Out
                </span>
            </div>
         )}

         {/* Sales Badge */}
         {product.discount > 0 && stock > 0 && (
             <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider z-10 shadow-sm">
                 -{product.discount}%
             </span>
         )}
      </div>

      {/* 2. TEXT DETAILS */}
      <div className="px-1">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">
             {product.categoryName || product.brandName || "Shop"}
         </p>
         <h3 className="text-gray-800 font-bold text-sm leading-tight mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
             {product.name}
         </h3>
         
         <div className="flex items-center gap-2">
             <p className="text-gray-900 font-black">
                 ₦{price.toLocaleString()}
             </p>
             {product.discount > 0 && (
                 <p className="text-xs text-gray-400 line-through">
                     ₦{(price * (1 + product.discount / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                 </p>
             )}
         </div>
      </div>

    </Link>
  );
};

export default ProductCard;