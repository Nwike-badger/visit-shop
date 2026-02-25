import ProductCard from "../product/ProductCard";

// Added 'isFlashSale' prop here
const ProductGrid = ({ products, columns = 4, gap = "normal", isFlashSale = false }) => {
  
  const gridConfig = {
    2: "grid-cols-2", 
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  const gapConfig = {
    tight: "gap-3",  
    normal: "gap-4 sm:gap-6", 
    wide: "gap-8",
  };

  const activeGrid = gridConfig[columns] || gridConfig[4];
  const activeGap = gapConfig[gap] || gapConfig.normal;

  return (
    <div className={`grid ${activeGrid} ${activeGap}`}>
      {products.map((product) => (
        <ProductCard 
            key={product.id} 
            product={product} 
            isFlashSale={isFlashSale} // 👈 Pass it down
        />
      ))}
    </div>
  );
};

export default ProductGrid;