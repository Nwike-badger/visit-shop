import { Link } from "react-router-dom";

const getDisplayImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80";
  }
  const primary = product.images.find((img) => img.isPrimary);
  return primary ? primary.url : product.images[0].url;
};

const ProductCard = ({ product }) => {
  return (
    <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
      {/* ADDED 'relative' here so the badge stays inside this box */}
      <Link to={`/product/${product.id}`} className="block h-64 overflow-hidden bg-gray-100 relative">
        <img
          src={getDisplayImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge Moved Here. It will overlay the image now. */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{product.discount}%
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {product.categoryName}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="font-bold text-lg block mb-2 hover:text-blue-600 line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-2">
          <p className="text-xl font-black text-gray-900">
            ₦{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;