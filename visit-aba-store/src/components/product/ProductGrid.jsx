// components/product/ProductGrid.jsx
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, columns = 4, gap = "normal", isFlashSale = false }) => {
  
  const gridConfig = {
    2: "grid-cols-2", 
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6",
  };

  const gapConfig = {
    tight: "gap-3 sm:gap-4",  
    normal: "gap-4 sm:gap-6 lg:gap-8", 
    wide: "gap-6 sm:gap-8 lg:gap-10",
  };

  const activeGrid = gridConfig[columns] || gridConfig[4];
  const activeGap = gapConfig[gap] || gapConfig.normal;

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