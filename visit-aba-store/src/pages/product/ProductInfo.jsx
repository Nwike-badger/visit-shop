import React, { useState, useEffect } from 'react';
import { Star, Heart, Minus, Plus, ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductInfo = ({ product }) => {
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  // New State for Stock Management
  const [currentStock, setCurrentStock] = useState(0);

  // 1. Auto-select defaults
  useEffect(() => {
    if (product.colors?.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
    if (product.sizes?.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
  }, [product]);

  // 2. 🔥 REAL-TIME STOCK RESOLVER
  // Anytime the user changes Color/Size, we recalculate how many are actually left.
  useEffect(() => {
    const variant = resolveVariant();
    if (variant) {
        setCurrentStock(variant.stockQuantity || 0);
    } else {
        // Fallback for products without variants
        setCurrentStock(product.stockQuantity || 0);
    }
    // Reset quantity to 1 when switching options to avoid invalid states
    setQuantity(1);
  }, [selectedColor, selectedSize, product]);

  const resolveVariant = () => {
    if (!product.variants || product.variants.length === 0) return null;

    return product.variants.find(v => {
        const attr = v.attributes || {};
        const colorMatch = !product.colors?.length || (selectedColor && attr['Color'] === selectedColor.name);
        const sizeMatch = !product.sizes?.length || (selectedSize && attr['Size'] === selectedSize);
        return colorMatch && sizeMatch;
    });
  };

  const handleAddToCart = async () => {
    const variant = resolveVariant();
    // Use variant ID if found, otherwise fallback to product ID (for simple items)
    const variantId = variant ? variant.id : product.id; 

    if (!variantId) {
      alert("Error: Product data is incomplete. Please refresh.");
      return;
    }

    setIsAdding(true);
    const success = await addToCart(variantId, quantity);
    setIsAdding(false);

    if (success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  // Helper for the Jumia-style stock bar
  const getStockStatus = () => {
    if (currentStock === 0) return { label: "Out of Stock", color: "bg-gray-200", text: "text-gray-500" };
    if (currentStock < 5) return { label: `Only ${currentStock} left!`, color: "bg-orange-500", text: "text-orange-600", width: "15%" };
    if (currentStock < 10) return { label: "Few Units Left", color: "bg-yellow-500", text: "text-yellow-600", width: "40%" };
    return { label: "In Stock", color: "bg-green-500", text: "text-green-600", width: "100%" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
        <div className="flex items-center gap-4">
          <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
          </div>
          
          {/* Dynamic Stock Text */}
          <span className={`text-sm font-bold ${stockStatus.text}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
         <span className="text-4xl font-black text-gray-900">₦{product.price?.toLocaleString()}</span>
         {product.originalPrice > product.price && (
            <span className="ml-3 text-xl text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
         )}
      </div>

      {/* JUMIA STYLE: Flash Sale / Scarcity Bar */}
      {currentStock > 0 && currentStock < 20 && (
        <div>
            <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wide text-gray-500">
                <span>Availability</span>
                <span>{currentStock} items</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${stockStatus.color} transition-all duration-500`} 
                    style={{ width: stockStatus.width || '100%' }}
                ></div>
            </div>
        </div>
      )}

      {/* OPTIONS (Colors/Sizes) */}
      <div className="space-y-6">
        {product.colors?.length > 0 && (
          <div>
            <span className="text-sm font-bold text-gray-900 mb-3 block">Select Color: {selectedColor?.name}</span>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${selectedColor?.name === color.name ? 'ring-2 ring-gray-900' : 'border-transparent'}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {product.sizes?.length > 0 && (
          <div>
             <span className="text-sm font-bold text-gray-900 mb-3 block">Select Size</span>
             <div className="flex gap-2">
               {product.sizes.map((size) => (
                 <button
                   key={size}
                   onClick={() => setSelectedSize(size)}
                   className={`px-4 py-2 text-sm font-bold rounded-lg border ${selectedSize === size ? 'bg-gray-900 text-white' : 'bg-white hover:border-gray-400'}`}
                 >
                   {size}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* ACTION AREA */}
      <div className="flex gap-4 pt-6">
           {/* Quantity Counter (Smart Limit) */}
           <div className={`flex items-center border rounded-xl w-32 justify-between px-2 ${currentStock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={() => quantity > 1 && setQuantity(q => q - 1)} 
                className="p-2 hover:text-blue-600"
              >
                <Minus size={16}/>
              </button>
              
              <span className="font-bold">{quantity}</span>
              
              <button 
                onClick={() => quantity < currentStock && setQuantity(q => q + 1)} 
                className={`p-2 ${quantity >= currentStock ? 'text-gray-300' : 'hover:text-blue-600'}`}
                disabled={quantity >= currentStock}
              >
                <Plus size={16}/>
              </button>
           </div>

           {/* Add To Cart Button */}
           <button 
             onClick={handleAddToCart}
             disabled={isAdding || currentStock === 0}
             className={`
                flex-1 font-bold text-lg rounded-xl py-3 transition flex items-center justify-center gap-2
                ${currentStock === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : isAdding 
                        ? 'bg-blue-400 text-white cursor-wait' 
                        : successMsg 
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}
             `}
           >
             {currentStock === 0 ? (
                <>Out of Stock</>
             ) : isAdding ? (
                'Processing...'
             ) : successMsg ? (
                <><CheckCircle/> Added!</>
             ) : (
                <><ShoppingCart/> Add to Cart</>
             )}
           </button>
      </div>
      
      {/* Warning if stock maxed out */}
      {quantity === currentStock && currentStock > 0 && (
          <p className="text-xs text-orange-600 flex items-center gap-1">
              <AlertTriangle size={12}/> Max available stock reached
          </p>
      )}
    </div>
  );
};

export default ProductInfo;