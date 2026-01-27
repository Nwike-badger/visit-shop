import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Gets 'laptop' from /search?q=laptop
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper for image display (same as Home.jsx)
  const getDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) return "https://via.placeholder.com/400";
    const primary = product.images.find((img) => img.isPrimary);
    return primary ? primary.url : product.images[0].url;
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Calls your backend: /api/products/search?q=...
        const response = await api.get(`/products/search?q=${query}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]); // Re-runs whenever the search query changes

  if (loading) return <div className="p-20 text-center text-xl">Searching for "{query}"...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for <span className="text-blue-600">"{query}"</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No products found matching that description.</p>
          <Link to="/" className="text-blue-600 font-semibold mt-4 inline-block hover:underline">
            Go back shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
              <Link to={`/product/${product.id}`} className="block h-64 overflow-hidden bg-gray-100">
                <img 
                  src={getDisplayImage(product)} 
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
      )}
    </div>
  );
};

export default SearchResults;