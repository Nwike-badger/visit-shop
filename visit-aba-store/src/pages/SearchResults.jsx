import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductGrid from '../components/product/ProductGrid';
import { SearchX, ArrowLeft } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; 
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 🔥 FIX: We pass the query as an object so Axios automatically URL-encodes it.
        // This prevents crashes when users search for multiple words (like "air max")
        const response = await api.get('/products/search', {
            params: { q: query }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); 

  // Match the loading state of the Home Page
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 font-medium">Searching for "{query}"...</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-gray-900">
            Search Results for <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Found {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Results Content */}
        {products.length === 0 ? (
          
          /* EMPTY STATE (Beautiful Error Handling) */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <SearchX size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.
            </p>
            <Link to="/" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
              Continue Shopping
            </Link>
          </div>

        ) : (
          
          /* SUCCESS STATE (Using our standard Product Grid!) */
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
             {/* By using ProductGrid, we automatically inherit the "Jumia Style" stock bars, discounts, and hover effects! */}
             <ProductGrid products={products} columns={5} gap="normal" />
          </div>

        )}
        
      </div>
    </div>
  );
};

export default SearchResults;