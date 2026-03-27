import { useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle, RefreshCw, SlidersHorizontal } from "lucide-react";
import CategoryBar from "../components/CategoryBar";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Catalog = () => {
  // Manage the current page state (Spring Boot is 0-indexed)
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20; 

  const { products, pageInfo, loading, error, refetch } = useProducts(currentPage, pageSize);

  const handleNextPage = () => {
    if (!pageInfo.last) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (!pageInfo.first) {
      setCurrentPage((prev) => Math.max(prev - 1, 0));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="bg-gray-50/30 min-h-screen pb-20 font-sans overflow-x-hidden">
      <CategoryBar />

      {/* ─── 1. CATALOG HERO BANNER ──────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-8 sm:mb-12 mt-2">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-sm min-h-[160px] sm:min-h-[280px] flex items-center">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80"
            alt="ExploreAba Catalog"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/70 to-transparent" />
          
          <div className="relative z-10 p-5 sm:p-12 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 rounded-full">
                The Complete Collection
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                All Products
              </h1>
            </div>
            
            {/* Optional Filter Toggle Button */}
            <button className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white text-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>
      </section>

      {/* ─── 2. PRODUCT GRID & STATE HANDLING ────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-10">
        {loading ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 min-h-[500px] flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white p-8 sm:p-20 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">Failed to load catalog</h2>
            <button onClick={refetch} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-gray-100 pb-4">
              <p className="text-xs sm:text-sm font-bold text-gray-500">
                Showing <span className="text-gray-900">{products.length}</span> results
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-500 hidden sm:block">
                Total Catalog: <span className="text-gray-900">{pageInfo.totalElements}</span> items
              </p>
            </div>

            <ProductGrid products={products} columns={5} gap="normal" />
            
            {/* ─── 3. INTELLIGENT PAGINATION CONTROLS ────────────────────── */}
            {pageInfo.totalPages > 1 && (
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
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products found in the catalog.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Catalog;