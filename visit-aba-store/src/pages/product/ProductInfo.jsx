import React, { useState } from 'react';
import { Star, Heart, Minus, Plus, ShoppingCart, CheckCircle } from 'lucide-react';

const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [added, setAdded] = useState(false);

  // Default to first option if not selected
  // useEffect(() => {
  //   if (product.colors?.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
  //   if (product.sizes?.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
  // }, [product]);

  const handleAddToCart = () => {
    // Validation
    if (product.sizes?.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    
    // Simulate API call
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    console.log("Adding to cart:", { id: product.id, qty: quantity, color: selectedColor, size: selectedSize });
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={18} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} />
             ))}
          </div>
          <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
            {product.reviewCount} verified reviews
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-green-600 font-bold">In Stock</span>
        </div>
      </div>

      {/* PRICE */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
         <div className="flex items-baseline gap-3">
           <span className="text-4xl font-black text-gray-900">₦{product.price?.toLocaleString()}</span>
           {product.originalPrice > product.price && (
             <span className="text-xl text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
           )}
         </div>
         {product.discount > 0 && (
           <div className="mt-2 inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
             Save {product.discount}%
           </div>
         )}
      </div>

      {/* SELECTORS */}
      <div className="space-y-6">
        
        {/* COLORS */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <span className="text-sm font-bold text-gray-900 mb-3 block">
              Select Color: <span className="text-gray-500 font-normal capitalize">{selectedColor?.name || 'None'}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 relative
                    ${selectedColor?.name === color.name ? 'ring-2 ring-offset-2 ring-gray-900' : 'hover:ring-2 hover:ring-gray-200'}
                  `}
                >
                  <div 
                    className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: color.hex }}
                  />
                  {/* Tooltip */}
                  <span className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SIZES */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-900">Select Size</span>
                <button className="text-xs text-blue-600 font-medium underline">Size Guide</button>
             </div>
             <div className="grid grid-cols-4 gap-2">
               {product.sizes.map((size) => (
                 <button
                   key={size}
                   onClick={() => setSelectedSize(size)}
                   className={`
                     py-2.5 text-sm font-bold rounded-lg border transition-all
                     ${selectedSize === size 
                       ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                       : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}
                   `}
                 >
                   {size}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* ACTION AREA */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex gap-4 mb-4">
           {/* Quantity */}
           <div className="flex items-center border-2 border-gray-200 rounded-xl w-32 justify-between px-1">
              <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="p-3 hover:text-blue-600 transition-colors"><Minus size={16}/></button>
              <span className="font-bold text-gray-900 text-lg">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:text-blue-600 transition-colors"><Plus size={16}/></button>
           </div>

           {/* Add to Cart Button */}
           <button 
             onClick={handleAddToCart}
             disabled={added}
             className={`
               flex-1 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95
               ${added 
                 ? 'bg-green-600 text-white shadow-green-200' 
                 : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}
             `}
           >
             {added ? (
               <> <CheckCircle size={24} /> Added to Cart </>
             ) : (
               <> <ShoppingCart size={24} /> Add to Cart </>
             )}
           </button>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 text-gray-500 font-medium hover:text-red-500 transition-colors py-2">
           <Heart size={18} /> Add to Wishlist
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;