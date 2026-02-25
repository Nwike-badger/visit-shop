import React from 'react';
import { useParams } from 'react-router-dom';
import useProduct from '../../hooks/useProduct'; 
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import TrustSidebar from './TrustSidebar';

const ProductPage = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id); 

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-blue-600 font-bold">Loading Product...</div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Product not found.
    </div>
  );

  // --- 🧠 DATA PREPARATION ---
  
  // 1. Extract Images
  // Ensure we handle both Object objects and simple strings if legacy data exists
  const galleryImages = product.images?.map(img => img.url || img) || [];

  // 2. Extract Colors & Sizes for UI
  // Your backend sends: variantOptions: [{name: "Color", values: ["Red"]}, {name: "Size", values: ["XL"]}]
  let colors = [];
  let sizes = [];

  if (product.variantOptions) {
    const colorOpt = product.variantOptions.find(o => o.name.toLowerCase() === 'color');
    if (colorOpt) {
        colors = colorOpt.values.map(val => ({ name: val, hex: getColorHex(val) }));
    }

    const sizeOpt = product.variantOptions.find(o => o.name.toLowerCase() === 'size');
    if (sizeOpt) {
        sizes = sizeOpt.values;
    }
  }

  // 3. Construct Enhanced Product for Child Components
  const enhancedProduct = {
    ...product,
    images: galleryImages,
    colors: colors,
    sizes: sizes,
    // Provide defaults for display if null
    price: product.basePrice || 0,
    originalPrice: product.compareAtPrice,
    seller: {
       name: product.brandName || "Official Store",
       rating: 4.8, 
       years: 3,
       successRate: "98%"
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 py-4 text-xs text-gray-500 uppercase tracking-wide">
        Home / {product.categoryName} / <span className="text-gray-900 font-bold">{product.name}</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 xl:col-span-6">
            <ProductGallery images={galleryImages} />
          </div>
          <div className="lg:col-span-4 xl:col-span-4">
            <ProductInfo product={enhancedProduct} />
          </div>
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            <TrustSidebar seller={enhancedProduct.seller} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple hex mapper for the UI bubbles
const getColorHex = (name) => {
  const map = { "black": "#000", "white": "#fff", "red": "#ef4444", "blue": "#3b82f6", "green": "#22c55e" };
  return map[name.toLowerCase()] || "#ccc";
};

export default ProductPage;