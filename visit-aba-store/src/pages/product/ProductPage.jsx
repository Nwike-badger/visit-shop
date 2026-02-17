import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useProduct from '../../hooks/useProduct'; // Your existing hook
import ProductGallery from '../../pages/product/ProductGallery';
import ProductInfo from '../../pages/product/ProductInfo';
import TrustSidebar from '../../pages/product/TrustSidebar';

const ProductPage = () => {
  const { id } = useParams();
  
  // Assuming your hook returns { product, loading, error }
  // If your hook uses "slug" instead of "id", ensure the param matches.
  const { product, loading, error } = useProduct(id); 

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 font-medium">Loading Product...</div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Product not found.
    </div>
  );

  // --- 🧠 DATA TRANSFORMER ---
  // The backend sends raw data. We format it for the UI here.
  
  // 1. Extract Images (Handle both object and string formats)
  const galleryImages = product.images?.map(img => 
    typeof img === 'string' ? img : img.url
  ) || [];

  // 2. Extract Colors & Sizes from variantOptions
  // Backend sends: [{ name: "Color", values: ["Red", "Blue"] }]
  // We convert to: colors: [{name: "Red", hex: "#..."}, ...], sizes: ["M", "L"]
  let parsedColors = [];
  let parsedSizes = [];

  if (product.variantOptions) {
    // Find the option named "Color" (case insensitive)
    const colorOption = product.variantOptions.find(o => o.name.toLowerCase() === 'color');
    if (colorOption) {
      parsedColors = colorOption.values.map(val => ({
        name: val,
        // Simple helper to guess hex code (or use a library/backend field later)
        hex: getColorHex(val) 
      }));
    }

    // Find the option named "Size"
    const sizeOption = product.variantOptions.find(o => o.name.toLowerCase() === 'size');
    if (sizeOption) {
      parsedSizes = sizeOption.values;
    }
  }

  // 3. Calculate Discounted vs Original Price
  // If backend sends `basePrice` (selling) and `compareAtPrice` (original)
  const displayPrice = product.basePrice;
  const originalPrice = product.compareAtPrice || (product.discount > 0 ? (product.basePrice / (1 - product.discount/100)) : null);
  const discountPercent = product.discount || (originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0);

  const enhancedProduct = {
    ...product,
    images: galleryImages,
    colors: parsedColors,
    sizes: parsedSizes,
    price: displayPrice,
    originalPrice: originalPrice,
    discount: discountPercent,
    seller: {
       name: product.brandName || "Official Store",
       rating: product.averageRating || 4.8,
       years: 3,
       successRate: "98%"
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 py-4 text-xs text-gray-500 uppercase tracking-wide">
        Home / {product.categoryName || 'Product'} / <span className="text-gray-900 font-bold">{product.name}</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Gallery (5 cols) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <ProductGallery images={galleryImages} />
          </div>

          {/* CENTER: Info (4 cols) */}
          <div className="lg:col-span-4 xl:col-span-4">
            <ProductInfo product={enhancedProduct} />
          </div>

          {/* RIGHT: Trust/Delivery (2 cols) - Hidden on smaller screens if needed */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            <TrustSidebar seller={enhancedProduct.seller} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for color bubbles
const getColorHex = (name) => {
  const colors = {
    "black": "#000000", "white": "#ffffff", "red": "#ef4444", 
    "blue": "#3b82f6", "green": "#22c55e", "yellow": "#eab308", 
    "purple": "#a855f7", "gray": "#6b7280", "wine": "#722F37", 
    "titanium": "#878681"
  };
  return colors[name.toLowerCase()] || "#cccccc";
};

export default ProductPage;