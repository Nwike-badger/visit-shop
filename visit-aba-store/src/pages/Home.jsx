import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, ArrowRight } from "lucide-react"; // Make sure to import these
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { products, loading } = useProducts();

  // 🔥 FIX: useMemo prevents the array and slices from recreating every render
  const LAYOUT_CONFIG = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return [
      {
        id: "section-1",
        type: "split",
        left: { title: "Flash Sales", products: products.slice(0, 4), align: "left", gap: "tight", isFlashSale: true },
        right: { title: "Trending Now", products: products.slice(4, 8), align: "left", gap: "tight" }
      },
      {
        id: "section-2",
        type: "full",
        title: "Explore Your Interests",
        products: products.length > 8 ? products.slice(8, 20) : products.slice(0, 10), 
        columns: 5,
        gap: "normal"
      },
      {
        id: "section-3",
        type: "full",
        title: "Clearance Deals",
        // Using slice instead of modifying the original array to prevent mutations
        products: products.slice(0, 6).reverse(), 
        columns: 6,
        gap: "tight",
        isFlashSale: true
      },
    ];
  }, [products]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 font-medium">Loading Experience...</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20 font-sans">
      
      {/* 1. CATEGORY BAR (Kept as is, it's good) */}
      <CategoryBar />

      {/* 2. HERO SECTION: "The Bento Grid" (Premium Look) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[500px]">
          
          {/* Main Hero (Fashion) - Spans 8 columns */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-2xl bg-gray-900 cursor-pointer">
             <img 
               src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" 
               alt="Fashion" 
               className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <span className="inline-block px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest mb-4 rounded-sm">
                  New Collection
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Redefine Your <br/>Style Statement
                </h2>
                <Link to="/category/fashion" className="inline-flex items-center gap-2 text-white font-bold border-b-2 border-white pb-1 hover:text-blue-400 hover:border-blue-400 transition-all">
                  Shop Fashion <ArrowRight size={18} />
                </Link>
             </div>
          </div>

          {/* Side Column - Spans 4 columns */}
          <div className="md:col-span-4 flex flex-col gap-4">
            
            {/* Top Right (Tech) */}
            <div className="flex-1 relative group overflow-hidden rounded-2xl bg-gray-800 cursor-pointer">
               <img 
                 src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80" 
                 alt="Electronics" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-6">
                 <h3 className="text-2xl font-bold text-white mb-1">Next-Gen Tech</h3>
                 <p className="text-gray-300 text-sm mb-3">Upgrade your workflow.</p>
                 <Link to="/category/electronics" className="text-xs font-bold text-white uppercase tracking-wider hover:text-blue-400">
                    Explore Gadgets &rarr;
                 </Link>
               </div>
            </div>

            {/* Bottom Right (Home) */}
            <div className="flex-1 relative group overflow-hidden rounded-2xl bg-gray-800 cursor-pointer">
               <img 
                 src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=600&q=80" 
                 alt="Home" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-6">
                 <h3 className="text-2xl font-bold text-white mb-1">Modern Living</h3>
                 <p className="text-gray-300 text-sm mb-3">Furniture & Decor.</p>
                 <Link to="/category/home-living" className="text-xs font-bold text-white uppercase tracking-wider hover:text-blue-400">
                    Shop Home &rarr;
                 </Link>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. TRUST SIGNALS (The "Professional" Strip) */}
      <div className="bg-white border-y border-gray-100 mb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex flex-col items-center gap-3 p-2">
                 <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <Truck size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">Nationwide Delivery</h4>
                    <p className="text-sm text-gray-500 mt-1">Free shipping on orders over ₦50,000</p>
                 </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-2">
                 <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">Secure Payments</h4>
                    <p className="text-sm text-gray-500 mt-1">100% secure payment processing</p>
                 </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-2">
                 <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <Clock size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">24/7 Support</h4>
                    <p className="text-sm text-gray-500 mt-1">Dedicated support anytime you need</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 4. DYNAMIC PRODUCT SECTIONS */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {LAYOUT_CONFIG.map((section) => {
          
          if (section.type === "split") {
            if (section.left.products.length === 0 && section.right.products.length === 0) return null;

            return (
              <div key={section.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Window */}
                <ProductSection 
                  title={section.left.title} 
                  align={section.left.align}
                  className="h-full"
                >
                  <ProductGrid 
                    products={section.left.products} 
                    columns={2} 
                    gap={section.left.gap} 
                    isFlashSale={section.left.isFlashSale} 
                  />
                </ProductSection>

                {/* Right Window */}
                <ProductSection 
                  title={section.right.title} 
                  align={section.right.align}
                  className="h-full"
                >
                  <ProductGrid 
                    products={section.right.products} 
                    columns={2} 
                    gap={section.right.gap}
                    isFlashSale={section.right.isFlashSale} 
                  />
                </ProductSection>
              </div>
            );
          }

          if (section.type === "full") {
            if (section.products.length === 0) return null;

            return (
              <div key={section.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <ProductSection 
                  title={section.title} 
                  align="left"
                >
                   <ProductGrid 
                      products={section.products} 
                      columns={section.columns || 5} 
                      gap={section.gap || "normal"}
                      isFlashSale={section.isFlashSale} 
                   />
                </ProductSection>
              </div>
            );
          }

          return null;
        })}

        {/* Bottom Call to Action */}
        <div className="bg-gray-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
             <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                <p className="text-gray-300 mb-8">Subscribe to our newsletter for exclusive drops and early access to sales.</p>
                <div className="flex gap-2 max-w-md mx-auto">
                    <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                    <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors">Subscribe</button>
                </div>
             </div>
             {/* Decorative Circle */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

      </div>
    </div>
  );
};

export default Home;