import { useMemo } from "react";
import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import ProductGrid from "../components/product/ProductGrid";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { products, loading } = useProducts();

  // --- CONFIGURATION ---
  const SPLIT_SECTION_COLUMNS = 3; 
  const SPLIT_SECTION_ROWS = 2;    
  const itemsPerSection = SPLIT_SECTION_COLUMNS * SPLIT_SECTION_ROWS; 

  // --- DATA SLICING ---
  const flashSaleProducts = useMemo(() => products.slice(0, itemsPerSection), [products, itemsPerSection]);
  const topTrendProducts = useMemo(() => products.slice(itemsPerSection, itemsPerSection * 2), [products, itemsPerSection]);
  const interestProducts = useMemo(() => products.slice(12, 22), [products]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading Store...</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <CategoryBar />

      {/* BANNER SECTION 
         Using max-w-[1440px] to match the new wider grid below.
      */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
         <div className="w-full aspect-[21/9] sm:h-[500px] sm:aspect-auto bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-lg p-6 relative overflow-hidden">
            {/* Background Pattern (Optional subtle detail for 'professional' feel) */}
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

      {/* MAIN CONTENT CONTAINER
         Changed max-w-7xl (1280px) -> max-w-[1440px].
         This adds about 160px of extra breathing room for your products.
      */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* THE 50/50 SPLIT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: FLASH SALES */}
          <ProductSection 
            title="Flash Sales" 
            align="center"
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-full"
          >
            <ProductGrid 
              products={flashSaleProducts} 
              columns={SPLIT_SECTION_COLUMNS} 
              gap="tight" 
            />
          </ProductSection>

          {/* RIGHT: TOP TRENDS */}
          <ProductSection 
            title="Top Trends" 
            align="center"
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-full"
          >
            <ProductGrid 
              products={topTrendProducts} 
              columns={SPLIT_SECTION_COLUMNS} 
              gap="tight" 
            />
          </ProductSection>
        </div>

        {/* FULL WIDTH SECTION */}
        <ProductSection title="Explore Your Interests" align="left">
           <ProductGrid products={interestProducts} columns={5} gap="normal" />
        </ProductSection>

      </div>
    </div>
  );
};

export default Home;