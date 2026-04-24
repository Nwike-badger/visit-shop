import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { SearchX, ArrowLeft, Search, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useSmartSearch } from '../hooks/useSmartSearch';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; 
  
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; 

  // Reset pagination if the user types a new search query
  useEffect(() => {
    setCurrentPage(0);
  }, [query]);
  
  const { results: products, pageInfo, loading, error, total } = useSmartSearch({ 
    query, 
    page: currentPage, 
    size: pageSize 
  });

  const handleNextPage = () => {
    if (pageInfo && !pageInfo.last) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (pageInfo && !pageInfo.first) {
      setCurrentPage((prev) => Math.max(prev - 1, 0));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Initial Loading State
  if (loading && currentPage === 0) return (
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
        
        {/* ─── Header Section ─── */}
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
                    Found {total} {total === 1 ? 'item' : 'items'} in our catalog
                  </p>
              </div>
          </div>
        </div>

        {/* ─── Error State ─── */}
        {error ? (
          <div className="bg-white p-8 sm:p-20 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">Search failed</h2>
            <button onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* ─── Empty State ─── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
              <SearchX size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
              We couldn't find any items matching <span className="text-gray-900 font-bold">"{query}"</span>. Try using more general keywords.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                  <Search size={18} /> Browse All Products
                </Link>
            </div>
          </div>
        ) : (
          /* ─── Success State ─── */
          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 relative">
             <ProductGrid products={products} columns={5} gap="normal" />
            
             {/* ─── Pagination Controls ─── */}
             {pageInfo && pageInfo.totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button 
                  onClick={handlePrevPage}
                  disabled={pageInfo.first}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-900 disabled:hover:border-gray-200 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Page <span className="text-gray-900 text-base">{pageInfo.number + 1}</span> of {pageInfo.totalPages}
                  </span>
                </div>

                <button 
                  onClick={handleNextPage}
                  disabled={pageInfo.last}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-900 disabled:hover:border-gray-200 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;