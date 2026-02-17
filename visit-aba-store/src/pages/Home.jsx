import { useMemo } from "react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { products, loading } = useProducts();

  // --- 🔌 PLUG-AND-PLAY LAYOUT CONFIGURATION ---
  // To Add/Remove/Edit sections, just modify this array.
  const LAYOUT_CONFIG = [
    {
      id: "section-1",
      type: "split", // Options: "split" (2 windows) or "full" (1 big window)
      left: { 
        title: "Flash Sales", 
        slice: [0, 6], // Takes first 6 products
        align: "center", 
        gap: "tight" 
      },
      right: { 
        title: "Top Trends", 
        slice: [6, 12], // Takes next 6 products
        align: "center", 
        gap: "tight" 
      }
    },
    {
      id: "section-2",
      type: "full",
      title: "Explore Your Interests",
      slice: [12, 22], // Takes 10 products
      columns: 5,
      gap: "normal"
    },
    // Example: I added "Distress Sales" below as you asked
    {
      id: "section-3",
      type: "full",
      title: "Distress Sales & Clearance",
      slice: [22, 28], // Takes 6 products
      columns: 6, // Smaller items, more columns
      gap: "tight"
    },
     // You can add "Awoof Buys" here easily...
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
         <div className="w-full aspect-[21/9] sm:h-[500px] sm:aspect-auto bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">
                Bespoke Tailoring
              </h1>
              <p className="text-lg md:text-2xl text-purple-100 max-w-2xl mx-auto font-light">
                Premium fabrics. Custom fits. Delivered to your door.
              </p>
            </div>
         </div>
      </div>

      {/* DYNAMIC LAYOUT GENERATOR */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {LAYOUT_CONFIG.map((section) => {
          
          // --- RENDER SPLIT SECTION (2 Windows) ---
          if (section.type === "split") {
            const leftProducts = products.slice(section.left.slice[0], section.left.slice[1]);
            const rightProducts = products.slice(section.right.slice[0], section.right.slice[1]);

            // Hide section if NO data exists (prevents empty boxes)
            if (leftProducts.length === 0 && rightProducts.length === 0) return null;

            return (
              <div key={section.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Window */}
                <ProductSection 
                  title={section.left.title} 
                  align={section.left.align}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-full"
                >
                  <ProductGrid products={leftProducts} columns={3} gap={section.left.gap} />
                </ProductSection>

                {/* Right Window */}
                <ProductSection 
                  title={section.right.title} 
                  align={section.right.align}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-full"
                >
                  <ProductGrid products={rightProducts} columns={3} gap={section.right.gap} />
                </ProductSection>
              </div>
            );
          }

          // --- RENDER FULL SECTION (1 Big Window) ---
          if (section.type === "full") {
            const sectionProducts = products.slice(section.slice[0], section.slice[1]);
            
            if (sectionProducts.length === 0) return null;

            return (
              <ProductSection 
                key={section.id} 
                title={section.title} 
                align="left"
              >
                 <ProductGrid 
                    products={sectionProducts} 
                    columns={section.columns || 5} 
                    gap={section.gap || "normal"} 
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