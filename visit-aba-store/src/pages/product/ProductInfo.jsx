import React, { useState, useEffect } from 'react';
import { Star, Minus, Plus, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductInfo = ({ product }) => {
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [currentStock, setCurrentStock] = useState(0);

  useEffect(() => {
    if (product.colors?.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
    if (product.sizes?.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
  }, [product]);

  useEffect(() => {
    const variant = resolveVariant();
    if (variant) {
        setCurrentStock(variant.stockQuantity || 0);
    } else {
        setCurrentStock(product.stockQuantity || 0);
    }
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
    const variantId = variant ? variant.id || variant.sku : product.id; 

    if (!variantId) {
      alert("Error: Product data is incomplete. Please refresh.");
      return;
    }

    // 🔥 THE FIX: GATHER THE EXACT ATTRIBUTES THE USER CLICKED
    const finalAttributes = {};
    if (selectedSize) finalAttributes.Size = selectedSize;
    if (selectedColor) finalAttributes.Color = selectedColor.name;

    setIsAdding(true);
    // 🔥 PASS THE ATTRIBUTES AS THE 3RD ARGUMENT!
    const success = await addToCart(variantId, quantity, finalAttributes);
    setIsAdding(false);

    if (success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  const getStockStatus = () => {
    if (currentStock === 0) return { label: "Out of Stock", color: "bg-gray-200", text: "text-gray-500" };
    if (currentStock < 5) return { label: `Only ${currentStock} left`, color: "bg-red-500", text: "text-red-600", width: "15%" };
    if (currentStock < 10) return { label: "Low Stock", color: "bg-yellow-500", text: "text-yellow-600", width: "40%" };
    return { label: "In Stock", color: "bg-green-500", text: "text-green-600", width: "100%" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brandName || "Exclusive"}</p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3 tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-4">
          <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${stockStatus.text}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
         <span className="text-3xl font-black text-gray-900 tracking-tight">₦{product.price?.toLocaleString()}</span>
         {product.originalPrice > product.price && (
            <span className="ml-3 text-lg text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
         )}
      </div>

      {/* Scarcity Bar */}
      {currentStock > 0 && currentStock < 20 && (
        <div>
            <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest text-gray-500">
                <span>Availability</span>
                <span>{currentStock} units</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                Color: <span className="text-gray-900">{selectedColor?.name}</span>
            </span>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${selectedColor?.name === color.name ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' : ''}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {product.sizes?.length > 0 && (
          <div>
             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Size</span>
             <div className="flex flex-wrap gap-2">
               {product.sizes.map((size) => (
                 <button
                   key={size}
                   onClick={() => setSelectedSize(size)}
                   className={`px-5 py-2.5 text-xs font-bold rounded-lg border transition-all ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}
                 >
                   {size}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* ACTION AREA */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
           {/* Quantity Counter */}
           <div className={`flex items-center border border-gray-200 rounded-xl w-32 justify-between px-2 ${currentStock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={() => quantity > 1 && setQuantity(q => q - 1)} 
                className="p-3 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Minus size={14}/>
              </button>
              
              <span className="font-bold text-sm">{quantity}</span>
              
              <button 
                onClick={() => quantity < currentStock && setQuantity(q => q + 1)} 
                className={`p-3 transition-colors ${quantity >= currentStock ? 'text-gray-200' : 'text-gray-400 hover:text-gray-900'}`}
                disabled={quantity >= currentStock}
              >
                <Plus size={14}/>
              </button>
           </div>

           {/* Add To Cart Button */}
           <button 
             onClick={handleAddToCart}
             disabled={isAdding || currentStock === 0}
             className={`flex-1 font-bold text-sm uppercase tracking-widest rounded-xl py-4 transition-all flex items-center justify-center gap-2
                ${currentStock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isAdding ? 'bg-gray-800 text-white cursor-wait' : successMsg ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 hover:-translate-y-0.5'}
             `}
           >
             {currentStock === 0 ? (
                "Out of Stock"
             ) : isAdding ? (
                'Processing...'
             ) : successMsg ? (
                <><CheckCircle size={18}/> Added!</>
             ) : (
                <><ShoppingBag size={18}/> Add to Bag</>
             )}
           </button>
      </div>
      
      {quantity === currentStock && currentStock > 0 && (
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1 mt-2">
              <AlertTriangle size={12}/> Max available stock reached
          </p>
      )}
    </div>
  );
};

export default ProductInfo;