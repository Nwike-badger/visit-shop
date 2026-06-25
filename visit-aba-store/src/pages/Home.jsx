import { Link } from "react-router-dom";
import { ArrowRight, Zap, AlertCircle, RefreshCw } from "lucide-react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import Footer from "../components/Footer";
import useProducts from "../hooks/useProducts";
import { heroUrl, mediumUrl } from "../utils/imageUtils";

// ─── Hero image URLs ──────────────────────────────────────────────────────────
// LCP hero: master tailor hand-stitching a garment in a sunlit atelier.
const BESPOKE_HERO_IMG =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=85&auto=format&fit=crop";

// Clothes card: striking editorial shot — bold African print dress on model.
const CLOTHES_IMG =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=85&auto=format&fit=crop";

// Shoes card: artisan hands finishing a pair of polished leather dress shoes.
const SHOES_IMG =
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=85&auto=format&fit=crop";

const Home = () => {
  const { products, loading, error, refetch } = useProducts(0, 10);
  const safeProducts = Array.isArray(products) ? products : (products?.content ?? []);

  return (
    <main className="bg-gray-50/30 min-h-screen font-sans overflow-x-hidden">

      {/* ─── 1. HERO: BENTO GRID ──────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-6 sm:mb-14 mt-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:h-[550px]">

          {/* ── Main hero card: Bespoke — entire card links to /custom ── */}
          <Link
            to="/custom"
            aria-label="Explore custom-made tailoring"
            className="lg:col-span-8 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-sm min-h-[240px] sm:min-h-[360px] lg:min-h-0 block focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
          >
            <img
              src={heroUrl(BESPOKE_HERO_IMG)}
              alt="Bespoke Tailoring"
              fetchpriority="high"       // LCP image — load immediately
              loading="eager"
              decoding="async"
              width={1400}
              height={700}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Lighter overlay — concentrated at the bottom so photography reads through up top */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-10 w-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white text-gray-900 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-5 rounded-full shadow-lg">
                <Zap size={10} className="text-green-600 sm:w-3 sm:h-3" /> Custom Made
              </span>
              <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight">
                Crafted in Aba, <br className="hidden sm:block" />Worn Globally.
              </h1>
              <span className="inline-flex items-center gap-1.5 sm:gap-3 text-white text-[9px] sm:text-sm font-bold uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                Start Your Design
                <ArrowRight size={12} className="sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform" />
              </span>
            </div>
          </Link>

          {/* ── Bento side cards ── */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 sm:gap-4">

            {/* ── Women — entire card links ── */}
            <Link
              to="/category/women"
              aria-label="Shop women's fashion"
              className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[110px] sm:min-h-[250px] lg:min-h-0 block focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
            >
              <img
                src={mediumUrl(CLOTHES_IMG)}
                alt="Nigerian Fashion"
                loading="lazy"
                decoding="async"
                width={800}
                height={533}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-8">
                <h3 className="text-sm sm:text-2xl font-black text-white mb-0.5 sm:mb-2 tracking-tight">Women</h3>
                <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                  Explore &rarr;
                </span>
              </div>
            </Link>

            {/* ── Footwear — entire card links ── */}
            <Link
              to="/category/footwear"
              aria-label="Shop footwear"
              className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[110px] sm:min-h-[250px] lg:min-h-0 block focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
            >
              <img
                src={mediumUrl(SHOES_IMG)}
                alt="Made in Nigeria Leather Footwear"
                loading="lazy"
                decoding="async"
                width={800}
                height={533}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-8">
                <h3 className="text-sm sm:text-2xl font-black text-white mb-0.5 sm:mb-2 tracking-tight">Footwear</h3>
                <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <CategoryBar />

      {/* ─── 2. TOP PRODUCT SHOWCASE ──────────────────────────────────── */}
      {/* Single deliberate top margin (no stacked mt+mb compounding into a gap) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mb-12 sm:mb-20 mt-6 sm:mt-10">
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
            <p className="text-gray-500 text-sm max-w-xs">We couldn't load products just now. Check your connection and try again.</p>
            {refetch && (
              <button onClick={refetch} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                <RefreshCw size={14} /> Try Again
              </button>
            )}
          </div>
        ) : safeProducts.length > 0 ? (
          <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <ProductSection title="Trending Now" align="left">
              {/*
                priorityCount=10 here because this is the first product grid on the page —
                all 10 cards are potentially above the fold on desktop, so we give them all
                eager/high-priority loading to hit the best possible LCP score.
              */}
              <ProductGrid products={safeProducts} columns={5} gap="normal" priorityCount={10} />
            </ProductSection>
            <div className="mt-6 sm:mt-10 text-center">
              <Link to="/products" className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-900 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                View All <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-1">No products yet</p>
            <p className="text-gray-400 text-sm">New arrivals are on the way — check back soon.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Home;