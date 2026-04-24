import ProductCard from "./ProductCard";

/**
 * ProductGrid
 *
 * Performance note:
 *   The first `priorityCount` cards (default 5) receive `priority={true}`, which tells
 *   ProductCard to set loading="eager" and fetchpriority="high" on their images.
 *   This means the Largest Contentful Paint (LCP) images load immediately without
 *   waiting for the lazy-load intersection observer to fire — critical for Core Web Vitals.
 *
 *   All other cards stay lazy, so we don't flood the network on page load.
 */
const ProductGrid = ({
  products,
  columns      = 4,
  gap          = 'normal',
  isFlashSale  = false,
  priorityCount = 5,   // how many cards above-the-fold get eager/high-priority loading
}) => {

  const gridConfig = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6',
  };

  const gapConfig = {
    tight:  'gap-1.5 sm:gap-3 lg:gap-4',
    normal: 'gap-2 sm:gap-4 lg:gap-6',
    wide:   'gap-3 sm:gap-6 lg:gap-8',
  };

  const activeGrid = gridConfig[columns] || gridConfig[4];
  const activeGap  = gapConfig[gap]      || gapConfig.normal;

  return (
    <div className={`grid ${activeGrid} ${activeGap}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isFlashSale={isFlashSale}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
};

export default ProductGrid;