import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, AlertCircle, RefreshCw } from "lucide-react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import Footer from "../components/Footer";
import useProducts from "../hooks/useProducts";

const HOME_PRODUCT_LIMIT = 10;

const Home = () => {
  const { products, loading, error, refetch } = useProducts();

  const safeProducts = useMemo(() => {
    let list = [];
    if (Array.isArray(products)) list = products;
    else if (products?.content && Array.isArray(products.content)) list = products.content;
    return list.slice(0, HOME_PRODUCT_LIMIT);
  }, [products]);

  return (
    <main className="bg-gray-50/30 min-h-screen font-sans overflow-x-hidden">

      {/* ─── 1. HERO: BENTO GRID ────────── */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-6 sm:mb-16 mt-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:h-[550px]">

          <div className="lg:col-span-8 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-sm min-h-[240px] sm:min-h-[360px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
              alt="New Fashion Collection"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-10 w-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white text-gray-900 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-6 rounded-full shadow-lg">
                <Zap size={10} className="text-green-600 sm:w-3 sm:h-3" /> Premium
              </span>
              <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-6 leading-[1.1] tracking-tight">
                Crafted in Aba, <br className="hidden sm:block" />Worn Globally.
              </h1>
              <Link
                to="/category/fashion"
                className="inline-flex items-center gap-1.5 sm:gap-3 text-white text-[9px] sm:text-sm font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors group/link"
              >
                Explore <ArrowRight size={12} className="sm:w-4 sm:h-4 group-hover/link:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 sm:gap-4">
            <div className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[110px] sm:min-h-[250px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80"
                alt="Electronics"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-8">
                <h3 className="text-sm sm:text-2xl font-black text-white mb-0.5 sm:mb-2 tracking-tight">Tech</h3>
                <Link to="/category/electronics" className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest hover:text-emerald-400 transition-colors">
                  Shop &rarr;
                </Link>
              </div>
            </div>

            <div className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[110px] sm:min-h-[250px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=600&q=80"
                alt="Home Living"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-8">
                <h3 className="text-sm sm:text-2xl font-black text-white mb-0.5 sm:mb-2 tracking-tight">Decor</h3>
                <Link to="/category/home-living" className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest hover:text-emerald-400 transition-colors">
                  Shop &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoryBar />

      {/* ─── 2. TOP PRODUCT SHOWCASE ─────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-10 sm:mb-20 mt-8 sm:mt-16">
        {loading ? (
          <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white p-8 sm:p-20 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-5">
              <AlertCircle size={24} className="text-red-500 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 mb-2">Something went wrong</h2>
            {refetch && (
              <button onClick={refetch} className="mt-2 sm:mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                <RefreshCw size={14} /> Try Again
              </button>
            )}
          </div>
        ) : safeProducts.length > 0 ? (
          <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <ProductSection title="Trending Now" align="left">
              <ProductGrid products={safeProducts} columns={5} gap="normal" />
            </ProductSection>
            <div className="mt-6 sm:mt-10 text-center">
              <Link to="/products" className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-900 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                View All <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm">No products found.</p>
          </div>
        )}
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <Footer />

    </main>
  );
};

export default Home;