import { useMemo } from "react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { products, loading } = useProducts();

  // --- 🧠 SMART LAYOUT LOGIC ---
  // Instead of hardcoded numbers, we adjust based on what we have.
  const LAYOUT_CONFIG = [
    {
      id: "section-1",
      type: "split",
      left: { 
        title: "Flash Sales", 
        // Logic: Take first 4 items. If we only have 2, take 2.
        products: products.slice(0, 4), 
        align: "center", 
        gap: "tight",
        isFlashSale: true 
      },
      right: { 
        title: "Top Trends", 
        // Logic: Take next 4 items.
        products: products.slice(4, 8), 
        align: "center", 
        gap: "tight" 
      }
    },
    {
      id: "section-2",
      type: "full",
      title: "Explore Your Interests",
      // Logic: If we have >8 items, show the rest. 
      // If we don't have enough data (dev mode), just REUSE the first 10 so the UI looks good.
      products: products.length > 8 ? products.slice(8, 20) : products.slice(0, 10), 
      columns: 5,
      gap: "normal"
    },
    {
      id: "section-3",
      type: "full",
      title: "Clearance Deals",
      // Logic: Show random mix for clearance feel
      products: products.slice(0, 6).reverse(), 
      columns: 6,
      gap: "tight",
      isFlashSale: true
    },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-blue-600 font-bold">Loading Store...</div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <CategoryBar />

      {/* BANNER */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
         <div className="w-full aspect-[21/9] sm:h-[500px] sm:aspect-auto bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            {/* Parallax-like effect on hover could go here */}
            <div className="relative z-10 space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm">
                Next-Gen Shopping
              </h1>
              <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto font-light">
                Experience the future of e-commerce. Fast, Secure, Reliable.
              </p>
              <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition transform hover:scale-105 shadow-xl">
                Start Exploring
              </button>
            </div>
         </div>
      </div>

      {/* DYNAMIC LAYOUT GENERATOR */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {LAYOUT_CONFIG.map((section) => {
          
          if (section.type === "split") {
            // Hide only if BOTH sides are empty
            if (section.left.products.length === 0 && section.right.products.length === 0) return null;

            return (
              <div key={section.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Window */}
                <ProductSection 
                  title={section.left.title} 
                  align={section.left.align}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full"
                >
                  <ProductGrid 
                    products={section.left.products} 
                    columns={2} // Better for split view
                    gap={section.left.gap} 
                    isFlashSale={section.left.isFlashSale} 
                  />
                </ProductSection>

                {/* Right Window */}
                <ProductSection 
                  title={section.right.title} 
                  align={section.right.align}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full"
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
              <ProductSection 
                key={section.id} 
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
            );
          }

          return null;
        })}

      </div>
    </div>
  );
};

export default Home;