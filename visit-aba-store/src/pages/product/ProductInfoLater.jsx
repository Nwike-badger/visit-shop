import React, { useState, useEffect } from 'react';
import { Star, Minus, Plus, ShoppingBag, CheckCircle, AlertTriangle, Ruler } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductInfoLater = ({ product }) => {
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  // 🔥 CUSTOM SIZE STATES
  const [customMeasurements, setCustomMeasurements] = useState({ bust: '', waist: '', hips: '' });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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
        // Match exact size OR catch anything labeled "Custom"
        const sizeMatch = !product.sizes?.length || (selectedSize && (attr['Size'] === selectedSize || (selectedSize.includes('Custom') && attr['Size']?.includes('Custom'))));
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

    // Capture Base Attributes
    let finalAttributes = { ...(variant?.attributes || {}) };

    // 🔥 BESPOKE VALIDATION: Block if fields are empty
    if (selectedSize?.includes('Custom') || selectedSize?.includes('Bespoke')) {
        if (!customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips) {
            alert("Please enter your Bust, Waist, and Hips measurements for your bespoke order.");
            return;
        }
        // Bundle the measurements into the attributes object
        finalAttributes = {
            ...finalAttributes,
            "Exact Bust": `${customMeasurements.bust} inches`,
            "Exact Waist": `${customMeasurements.waist} inches`,
            "Exact Hips": `${customMeasurements.hips} inches`
        };
    }

    setIsAdding(true);
    // Send variantId, quantity, AND finalAttributes
    const success = await addToCart(variantId, quantity, finalAttributes);
    setIsAdding(false);

    if (success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      setCustomMeasurements({ bust: '', waist: '', hips: '' }); // Reset form
    }
  };

  const getStockStatus = () => {
    if (selectedSize?.includes('Custom') || selectedSize?.includes('Bespoke')) return { label: "Made to Order", color: "bg-blue-500", text: "text-blue-600", width: "100%" };
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brandName || "Exclusive"}</p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3 tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-4">
          <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${stockStatus.text}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
         <span className="text-3xl font-black text-gray-900 tracking-tight">₦{product.price?.toLocaleString()}</span>
         {product.originalPrice > product.price && (
            <span className="ml-3 text-lg text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
         )}
      </div>

      {/* Scarcity Bar (Hidden for Custom Orders) */}
      {currentStock > 0 && currentStock < 20 && !selectedSize?.includes('Custom') && (
        <div>
            <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest text-gray-500">
                <span>Availability</span>
                <span>{currentStock} items</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${stockStatus.color} transition-all duration-500`} 
                    style={{ width: stockStatus.width || '100%' }}
                ></div>
            </div>
        </div>
      )}

      {/* OPTIONS */}
      <div className="space-y-6">
        {product.colors?.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Color: <span className="text-gray-900">{selectedColor?.name}</span></span>
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
             <div className="flex justify-between items-end mb-3">
                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Size</span>
                 <button onClick={() => setShowSizeGuide(true)} className="text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest flex items-center gap-1 transition-colors">
                     <Ruler size={12}/> Size Guide
                 </button>
             </div>
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

        {/* 🔥 THE BESPOKE INPUTS (Reveals when Custom Size is clicked) */}
        {(selectedSize?.includes('Custom') || selectedSize?.includes('Bespoke')) && (
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-bold text-blue-900 text-sm tracking-tight mb-1">Bespoke Measurements</h4>
                <p className="text-[11px] text-blue-700 mb-4 uppercase tracking-wider font-medium">Please provide exact body measurements in inches.</p>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">Bust</label>
                        <input type="number" value={customMeasurements.bust} onChange={(e) => setCustomMeasurements({...customMeasurements, bust: e.target.value})} className="w-full p-2.5 text-sm font-bold border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="36" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">Waist</label>
                        <input type="number" value={customMeasurements.waist} onChange={(e) => setCustomMeasurements({...customMeasurements, waist: e.target.value})} className="w-full p-2.5 text-sm font-bold border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="29" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">Hips</label>
                        <input type="number" value={customMeasurements.hips} onChange={(e) => setCustomMeasurements({...customMeasurements, hips: e.target.value})} className="w-full p-2.5 text-sm font-bold border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="40" />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* ACTION AREA */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
           {/* Quantity Counter */}
           <div className={`flex items-center border border-gray-200 rounded-xl w-32 justify-between px-2 ${currentStock === 0 && !selectedSize?.includes('Custom') ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
                <Minus size={14}/>
              </button>
              <span className="font-bold text-sm">{quantity}</span>
              <button 
                onClick={() => quantity < currentStock && setQuantity(q => q + 1)} 
                className={`p-3 transition-colors ${quantity >= currentStock && !selectedSize?.includes('Custom') ? 'text-gray-200' : 'text-gray-400 hover:text-gray-900'}`}
                disabled={quantity >= currentStock && !selectedSize?.includes('Custom')}
              >
                <Plus size={14}/>
              </button>
           </div>

           <button 
             onClick={handleAddToCart}
             disabled={isAdding || (currentStock === 0 && !selectedSize?.includes('Custom'))}
             className={`flex-1 font-bold text-sm uppercase tracking-widest rounded-xl py-4 transition-all flex items-center justify-center gap-2
                ${(currentStock === 0 && !selectedSize?.includes('Custom')) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isAdding ? 'bg-gray-800 text-white cursor-wait' : successMsg ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 hover:-translate-y-0.5'}
             `}
           >
             {(currentStock === 0 && !selectedSize?.includes('Custom')) ? "Out of Stock" : isAdding ? 'Processing...' : successMsg ? <><CheckCircle size={18}/> Added!</> : <><ShoppingBag size={18}/> Add to Bag</>}
           </button>
      </div>
      
      {quantity === currentStock && currentStock > 0 && !selectedSize?.includes('Custom') && (
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1 mt-2">
              <AlertTriangle size={12}/> Max available stock reached
          </p>
      )}

      {/* THE SIZE GUIDE MODAL */}
      {showSizeGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
                <div className="bg-[#f9f8f6] p-8 sm:p-10 rounded-2xl max-w-md w-full shadow-2xl font-serif text-[#332f2a] text-center relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowSizeGuide(false)} className="absolute top-4 right-5 font-sans text-2xl text-gray-400 hover:text-gray-900 transition-colors">&times;</button>
                    <h2 className="text-2xl font-bold tracking-widest mb-1 uppercase text-gray-900">Belle Femme</h2>
                    <h3 className="text-sm font-sans font-bold text-gray-400 tracking-widest mb-8 uppercase">Size Guide</h3>
                    
                    <div className="grid grid-cols-4 gap-2 font-bold mb-4 border-b border-gray-300 pb-3 text-xs tracking-widest">
                        <span>SIZE</span><span>BUST</span><span>WAIST</span><span>HIPS</span>
                    </div>
                    {[
                        [6, 32, 26, 36], [8, 34, 28, 38], [10, 36, 30, 40],
                        [12, 38, 32, 42], [14, 40, 34, 44], [16, 42, 36, 46],
                        [18, 44, 38, 48], [20, 46, 40, 50], [22, 48, 42, 52]
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-3 text-sm font-sans text-gray-700">
                            {row.map((val, j) => <span key={j}>{val}</span>)}
                        </div>
                    ))}
                    <p className="mt-8 text-[10px] font-sans font-bold tracking-widest text-gray-500 uppercase">Note: Patterns include an extra 2 to 4 inches for ease.</p>
                </div>
            </div>
      )}
    </div>
  );
};

export default ProductInfoLater;