import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, ArrowRight, Zap, AlertCircle, RefreshCw, CheckCircle, Tag } from "lucide-react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const HOME_PRODUCT_LIMIT = 10;

const Home = () => {
  const { products, loading, error, refetch } = useProducts();

  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");

  const safeProducts = useMemo(() => {
    let list = [];
    if (Array.isArray(products)) list = products;
    else if (products?.content && Array.isArray(products.content)) list = products.content;
    return list.slice(0, HOME_PRODUCT_LIMIT);
  }, [products]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus("loading");
    try {
      await new Promise((res) => setTimeout(res, 800)); 
      setNewsletterStatus("success");
      setEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Curating Experience...
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 font-medium mb-6">
          We couldn't load the store right now. Please try again.
        </p>
        {refetch && (
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="bg-gray-50/30 min-h-screen pb-20 font-sans overflow-x-hidden">
      <CategoryBar />

      {/* ─── 1. HERO: BENTO GRID (Slimmer on mobile) ─────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-16 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:h-[550px]">
          
          {/* Main Hero: Reduced mobile height from 450px to 320px */}
          <div className="lg:col-span-8 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-sm min-h-[320px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
              alt="New Fashion Collection"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 sm:p-10 md:p-14 w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-white text-gray-900 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-6 rounded-full shadow-lg">
                <Zap size={10} className="text-blue-600 sm:w-3 sm:h-3" /> Premium Selection
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                Crafted in Aba, <br className="hidden sm:block" />Worn Globally.
              </h1>
              <Link
                to="/category/fashion"
                className="inline-flex items-center gap-2 sm:gap-3 text-white text-[10px] sm:text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors group/link"
              >
                Explore Collection <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover/link:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Sub Heroes: Forced side-by-side on mobile to save vertical space */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[140px] sm:min-h-[250px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80"
                alt="Electronics"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 sm:p-8">
                <h3 className="text-base sm:text-2xl font-black text-white mb-1 sm:mb-2 tracking-tight">Tech</h3>
                <Link to="/category/electronics" className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-widest hover:text-blue-400 transition-colors">
                  Shop &rarr;
                </Link>
              </div>
            </div>

            <div className="flex-1 relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-800 shadow-sm min-h-[140px] sm:min-h-[250px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=600&q=80"
                alt="Home Living"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 sm:p-8">
                <h3 className="text-base sm:text-2xl font-black text-white mb-1 sm:mb-2 tracking-tight">Decor</h3>
                <Link to="/category/home-living" className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-widest hover:text-blue-400 transition-colors">
                  Shop &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST SIGNALS (Mobile Swipe Carousel) ────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
        {/* On mobile: overflow-x-auto, hide scrollbar. On desktop: standard grid. */}
        <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { icon: Truck, title: "Nationwide Delivery", sub: "Fast & reliable logistics" },
            { icon: ShieldCheck, title: "Secure Payments", sub: "100% encrypted" },
            { icon: Clock, title: "24/7 Support", sub: "Always here to help" },
          ].map(({ icon: Icon, title, sub }) => (
            <div 
              key={title} 
              // w-[85%] on mobile ensures they peek off-screen so the user knows to swipe
              className="shrink-0 w-[80%] sm:w-auto snap-center flex items-center gap-3 sm:gap-5 p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl text-gray-900 shrink-0">
                <Icon size={16} className="sm:w-6 sm:h-6" />
              </div>
              <div className="truncate">
                <h4 className="font-black text-gray-900 text-xs sm:text-sm tracking-tight truncate">{title}</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. TOP PRODUCT SHOWCASE ─────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
        {safeProducts.length > 0 ? (
          <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <ProductSection title="Trending Now" align="left">
              <ProductGrid products={safeProducts} columns={5} gap="normal" />
            </ProductSection>
            <div className="mt-8 sm:mt-10 text-center">
              <Link to="/products" className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-900 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                View All Catalog <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm">No products found.</p>
          </div>
        )}
      </section>

      {/* ─── 4. PROMOTIONAL BANNER (Slimmer on mobile) ───────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
         <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-blue-900 shadow-lg min-h-[180px] sm:min-h-[300px] flex items-center group cursor-pointer">
            <img 
               src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80" 
               alt="Sponsored Promotion"
               loading="lazy"
               className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/80 to-transparent" />
            
            <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-2xl">
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-100 border border-blue-400/30 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 rounded-full backdrop-blur-sm">
                  <Tag size={10} className="sm:w-3 sm:h-3" /> Sponsored
               </span>
               <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight tracking-tight">
                 Up to 40% Off <br className="hidden sm:block"/> Leather Goods
               </h2>
               <p className="text-blue-100 text-[10px] sm:text-sm font-medium mb-4 sm:mb-8 max-w-sm hidden sm:block">
                 Discover premium craftsmanship. Offer valid while stock lasts from our top-rated Aba artisans.
               </p>
               <Link to="/campaign/leather-sale" className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-900 text-[10px] sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl hover:bg-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                 Shop Sale <ArrowRight size={14} className="sm:w-4 sm:h-4" />
               </Link>
            </div>
         </div>
      </section>

      {/* ─── 5. FEATURED BRANDS (Mobile Swipe Carousel) ──────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20 text-center">
         <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 sm:mb-8">Trusted by Premium Nigerian Brands</p>
         <div className="flex sm:flex-wrap sm:justify-center items-center gap-8 sm:gap-16 opacity-60 hover:opacity-100 transition-all duration-500 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="snap-center shrink-0 text-xl sm:text-2xl font-black font-serif grayscale hover:grayscale-0 transition-all">AbaLeatherCo.</div>
            <div className="snap-center shrink-0 text-xl sm:text-2xl font-black tracking-tighter grayscale hover:grayscale-0 transition-all">NaijaTech</div>
            <div className="snap-center shrink-0 text-xl sm:text-2xl font-bold uppercase tracking-widest grayscale hover:grayscale-0 transition-all">Aura</div>
            <div className="snap-center shrink-0 text-xl sm:text-2xl font-black font-mono grayscale hover:grayscale-0 transition-all">STYLE<span className="text-blue-600">NG</span></div>
            <div className="snap-center shrink-0 text-lg sm:text-xl font-bold italic grayscale hover:grayscale-0 transition-all">Heritage</div>
         </div>
      </section>

      {/* ─── 6. NEWSLETTER ───────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 tracking-tight">Stay in the Loop</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-10 font-medium px-4">
              Subscribe for exclusive drops and early access to sales.
            </p>

            {newsletterStatus === "success" ? (
              <div className="flex items-center justify-center gap-3 py-2 sm:py-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={16} className="text-white sm:w-5 sm:h-5" />
                </div>
                <p className="text-white font-bold text-xs sm:text-sm">
                  You're subscribed! Watch your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  disabled={newsletterStatus === "loading"}
                  className="flex-1 px-4 py-3 sm:px-5 sm:py-4 rounded-xl text-gray-900 text-xs sm:text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-colors placeholder:text-gray-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading" || !email.trim()}
                  className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all shadow-lg shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {newsletterStatus === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
            {newsletterStatus === "error" && (
              <p className="mt-3 text-red-400 text-[10px] sm:text-xs font-bold">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;