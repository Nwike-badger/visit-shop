import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductGrid from '../components/product/ProductGrid';
import { SearchX, ArrowLeft, Search } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
           Searching for "{query}"...
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                    Results for <span className="text-blue-600 px-1">"{query}"</span>
                  </h1>
                  <p className="text-gray-500 mt-2 font-medium">
                    Found {products.length} {products.length === 1 ? 'item' : 'items'} in our catalog
                  </p>
              </div>
          </div>
        </div>

        {/* Results Content */}
        {products.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
              <SearchX size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
              We couldn't find any items matching <span className="text-gray-900 font-bold">"{query}"</span>. Try using more general keywords or checking your spelling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                  <Search size={18} /> Browse All Products
                </Link>
            </div>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100">
             <ProductGrid products={products} columns={5} gap="normal" />
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SearchResults;