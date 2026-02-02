import ProductCard from "./ProductCard";

const ProductGrid = ({ products, columns = 4, gap = "normal" }) => {
  
  // 1. Safe Tailwind Mapping (Avoids JIT compilation errors)
  const gridConfig = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  // 2. Gap configuration
  const gapConfig = {
    tight: "gap-4",
    normal: "gap-6",
    wide: "gap-10",
  };

  const activeGrid = gridConfig[columns] || gridConfig[4];
  const activeGap = gapConfig[gap] || gapConfig.normal;

  return (
    <div className={`grid ${activeGrid} ${activeGap}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;