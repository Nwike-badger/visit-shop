import ProductCard from "./ProductCard";

const ProductGrid = ({ products, columns = 4, gap = "normal", isFlashSale = false }) => {
  const gridConfig = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6",
  };

  // ── KEY FIX: mobile gap was `gap-4` (16px) — way too wide for 2-col.
  //    Now `gap-2` (8px) on mobile keeps cards edge-to-edge like ASOS/Zara.
  const gapConfig = {
    tight:  "gap-1.5 sm:gap-3 lg:gap-4",
    normal: "gap-2 sm:gap-4 lg:gap-6",
    wide:   "gap-3 sm:gap-6 lg:gap-8",
  };

  const activeGrid = gridConfig[columns] || gridConfig[4];
  const activeGap  = gapConfig[gap]     || gapConfig.normal;

  return (
    <div className={`grid ${activeGrid} ${activeGap}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFlashSale={isFlashSale}
        />
      ))}
    </div>
  );
};

export default ProductGrid;