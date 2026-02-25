import { Link } from "react-router-dom";

const getDisplayImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return "https://via.placeholder.com/400";
  }
  const primary = product.images.find((img) => img.isPrimary);
  return primary ? primary.url : product.images[0].url;
};

const ProductCard = ({ product, isFlashSale }) => {
  const hasDiscount = product.discount > 0;
  
  // Use 'totalStock' from backend product aggregation
  const stock = product.stockQuantity || 0; 
  
  // Calculate mock progress for flash sales (since we don't store "total initial stock", we assume batch size of 20 for visuals)
  const progressWidth = Math.min(100, Math.max(10, (stock / 20) * 100)) + "%";
  
  // Jumia Style: Show bar if flash sale OR if stock is critically low (<10)
  const showStockBar = isFlashSale || stock < 10;

  return (
    <div className="group border border-gray-100 rounded-lg overflow-hidden bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 flex flex-col h-full relative">
      
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={getDisplayImage(product)}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${stock === 0 ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
        />
        
        {hasDiscount && stock > 0 && (
          <div className="absolute top-2 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
            -{product.discount}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Sold Out
                </span>
            </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-grow">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 truncate">
          {product.categoryName}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="font-medium text-sm text-gray-800 hover:text-blue-600 truncate block mb-1"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="mt-auto">
          <p className="text-base font-bold text-gray-900">
            ₦{product.price.toLocaleString()}
          </p>
          
          {hasDiscount && (
             <p className="text-xs text-gray-400 line-through">
               ₦{(product.price * (1 + product.discount / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}
             </p>
          )}

          {/* 🔥 JUMIA STYLE STOCK BAR */}
          {showStockBar && stock > 0 && (
            <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>{stock} items left</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${stock < 5 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                        style={{ width: progressWidth }}
                    ></div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;