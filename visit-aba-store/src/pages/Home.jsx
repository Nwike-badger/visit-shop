import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Define the helper function here (Component Scope)
  const getDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return "https://via.placeholder.com/400";
    }
    const primary = product.images.find((img) => img.isPrimary);
    return primary ? primary.url : product.images[0].url;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center p-20 text-xl">Loading Store...</div>;
  if (error) return <div className="text-center p-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
            <Link to={`/product/${product.id}`} className="block h-64 overflow-hidden bg-gray-100">
              <img 
                src={getDisplayImage(product)} // ✅ Now this call works!
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{product.categoryName}</p>
              <Link to={`/product/${product.id}`} className="font-bold text-lg block mb-2 hover:text-blue-600 line-clamp-2">
                {product.name}
              </Link>
              <div className="mt-auto pt-2">
                <p className="text-xl font-black text-gray-900">
                    ₦{product.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;