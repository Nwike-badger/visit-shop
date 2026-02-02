// components/product/ProductCard.jsx
import { Link } from "react-router-dom";

const getDisplayImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80";
  }
  const primary = product.images.find((img) => img.isPrimary);
  return primary ? primary.url : product.images[0].url;
};

const ProductCard = ({ product }) => {
  const hasDiscount = product.discount > 0;

  return (
    <div className="group border border-gray-100 rounded-lg overflow-hidden bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 flex flex-col h-full relative">
      
      {/* IMAGE CONTAINER */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-200">
        <img
          src={getDisplayImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
            -{product.discount}%
          </div>
        )}
      </Link>

      {/* TEXT CONTENT */}
      <div className="p-3 flex flex-col flex-grow">
        
        {/* Category */}
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 truncate">
          {product.categoryName}
        </p>

        {/* Title: CHANGED 
            - Removed 'line-clamp-2'
            - Added 'truncate': Forces single line with ...
            - Added 'block': Ensures it takes full width
        */}
        <Link
          to={`/product/${product.id}`}
          className="font-medium text-sm text-gray-800 hover:text-blue-600 truncate block mb-1"
          title={product.name} // Keeps the hover tooltip so users can read the full name
        >
          {product.name}
        </Link>

        {/* Price Section */}
        <div className="mt-auto">
          <p className="text-base font-bold text-gray-900">
            ₦{product.price.toLocaleString()}
          </p>
          
          {hasDiscount && (
             <p className="text-xs text-gray-400 line-through">
               ₦{(product.price * (1 + product.discount / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;