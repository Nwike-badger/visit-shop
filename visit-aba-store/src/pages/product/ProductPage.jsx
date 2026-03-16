import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useProduct from '../../hooks/useProduct';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import TrustSidebar from './TrustSidebar';

// ── Skeleton loader ────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

const ProductPageSkeleton = () => (
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <Skeleton className="aspect-square" />
        <div className="flex gap-2 mt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="w-16 h-16" />)}</div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-14 w-32" />
          <Skeleton className="h-14 flex-1" />
        </div>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
const ProductPage = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  if (loading) return (
    <div className="bg-white min-h-screen pb-20">
      <ProductPageSkeleton />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <p className="text-4xl mb-4">📦</p>
        <h2 className="text-xl font-black text-gray-900 mb-2">Product not found</h2>
        <p className="text-sm text-gray-500 mb-6">This product may have been removed or doesn't exist.</p>
        <Link to="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors">
          Back to Store
        </Link>
      </div>
    </div>
  );

  
  const galleryImages = (product.images || [])
    .map(img => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);

  
  const activeVariants = (product.variants || []).filter(v => v.active !== false);

  
  const enhancedProduct = {
    ...product,
    variants: activeVariants,
    images: galleryImages,
    // When variants exist, minPrice is what the homepage shows; use it as the default display price
    price: activeVariants.length > 0 ? (product.minPrice || product.basePrice || 0) : (product.basePrice || 0),
    originalPrice: product.compareAtPrice || null,
    seller: {
      name: product.brandName || 'Official Store',
      rating: product.averageRating?.toFixed(1) || '4.8',
      years: 3,
      successRate: '98%',
    },
  };

  return (
    <div className="bg-white min-h-screen pb-24 font-sans">

      {/* ── Breadcrumb (with real links) ─────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium flex-wrap">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          {product.categoryName && (
            <>
              <ChevronRight size={12} />
              <Link
                to={`/category/${product.categorySlug}`}
                className="hover:text-gray-900 transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Product grid ────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          FIX: layout was 6-4-2 which made TrustSidebar only 2 cols (too narrow).
          New layout: 5-4-3 gives TrustSidebar 25% which is comfortable.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Gallery — 5 cols */}
          <div className="lg:col-span-5">
            <ProductGallery images={galleryImages} />
          </div>

          {/* Product info — 4 cols */}
          <div className="lg:col-span-4">
            <ProductInfo product={enhancedProduct} />
          </div>

          {/* Trust sidebar — 3 cols */}
          <div className="lg:col-span-3">
            <TrustSidebar seller={enhancedProduct.seller} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;