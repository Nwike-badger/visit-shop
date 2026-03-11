import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, ArrowRight, Zap } from "lucide-react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { products, loading } = useProducts();

  // Safely extract the products array (handles both paginated and raw arrays)
  const safeProducts = useMemo(() => {
    if (Array.isArray(products)) return products;
    if (products?.content && Array.isArray(products.content)) return products.content;
    return [];
  }, [products]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Curating Experience...</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen pb-20 font-sans">
      <CategoryBar />

      {/* 2. HERO SECTION: "The Bento Grid" */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[550px]">
          
          {/* Main Hero (Fashion) */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-3xl bg-gray-900 cursor-pointer shadow-sm">
             <img 
               src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" 
               alt="Fashion" 
               className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-8 md:p-14">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest mb-6 rounded-full shadow-lg">
                  <Zap size={12} className="text-blue-600" /> New Collection
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                  Redefine Your <br/>Style Statement
                </h2>
                <Link to="/category/fashion" className="inline-flex items-center gap-3 text-white text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors group/link">
                  Explore Collection <ArrowRight size={16} className="group-hover/link:translate-x-2 transition-transform" />
                </Link>
             </div>
          </div>

          {/* Side Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex-1 relative group overflow-hidden rounded-3xl bg-gray-800 cursor-pointer shadow-sm">
               <img 
                 src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80" 
                 alt="Electronics" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-8">
                 <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Next-Gen Tech</h3>
                 <p className="text-gray-300 text-xs font-medium mb-4">Upgrade your workflow.</p>
                 <Link to="/category/electronics" className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-blue-400">
                    Shop Gadgets &rarr;
                 </Link>
               </div>
            </div>

            <div className="flex-1 relative group overflow-hidden rounded-3xl bg-gray-800 cursor-pointer shadow-sm">
               <img 
                 src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=600&q=80" 
                 alt="Home" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-8">
                 <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Modern Living</h3>
                 <p className="text-gray-300 text-xs font-medium mb-4">Curated furniture & decor.</p>
                 <Link to="/category/home-living" className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-blue-400">
                    Shop Home &rarr;
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRUST SIGNALS */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="p-4 bg-gray-50 rounded-xl text-gray-900"><Truck size={24} /></div>
                 <div>
                    <h4 className="font-black text-gray-900 text-sm tracking-tight">Nationwide Delivery</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Free shipping over ₦50k</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="p-4 bg-gray-50 rounded-xl text-gray-900"><ShieldCheck size={24} /></div>
                 <div>
                    <h4 className="font-black text-gray-900 text-sm tracking-tight">Secure Payments</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">100% encrypted processing</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="p-4 bg-gray-50 rounded-xl text-gray-900"><Clock size={24} /></div>
                 <div>
                    <h4 className="font-black text-gray-900 text-sm tracking-tight">24/7 Support</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Always here to help you</p>
                 </div>
              </div>
           </div>
      </div>

      {/* 4. THE MAIN PRODUCT SHOWCASE */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {safeProducts.length > 0 ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
              <ProductSection title="Explore Our Collection" align="left">
                 <ProductGrid 
                    products={safeProducts} 
                    columns={5} 
                    gap="normal"
                 />
              </ProductSection>
            </div>
        ) : (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">
                No products found. Please check your database.
            </div>
        )}

        {/* Bottom Newsletter */}
        <div className="bg-gray-900 rounded-3xl p-14 text-center text-white relative overflow-hidden">
             <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Stay in the Loop</h2>
                <p className="text-gray-400 text-sm mb-10 font-medium">Subscribe to our newsletter for exclusive drops and early access to sales.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input type="email" placeholder="Email address" className="flex-1 px-5 py-4 rounded-xl text-gray-900 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/30" />
                    <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-colors shadow-lg">Subscribe</button>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Home;