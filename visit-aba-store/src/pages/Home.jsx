import CategoryBar from "../components/CategoryBar";
import ProductSection from "../components/product/ProductSection";
import useProducts from "../hooks/useProducts";
import { useMemo } from "react";
import ProductGrid from '../components/product/ProductGrid'



const Home = () => {
  const { products, loading } = useProducts();

  // --- CONFIGURATION ZONE ---
  // Change these numbers to control the "vertical" height
  const SPLIT_SECTION_COLUMNS = 3; // You asked for 3 columns per side
  const SPLIT_SECTION_ROWS = 2;    // You asked for 2 rows vertical
  
  // Math: 3 cols * 2 rows = 6 items needed per section
  const itemsPerSection = SPLIT_SECTION_COLUMNS * SPLIT_SECTION_ROWS; 

  // --- DATA SLICING ---
  const flashSaleProducts = useMemo(() => 
    products.slice(0, itemsPerSection), 
  [products, itemsPerSection]);

  const topTrendProducts = useMemo(() => 
    products.slice(itemsPerSection, itemsPerSection * 2), 
  [products, itemsPerSection]);
  
  const interestProducts = useMemo(() => products.slice(12, 22), [products]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full h-92 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
            choose your tailor 
            <br />
            bespoke
         </div>
      <CategoryBar />

      <div className="w-full h-92 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
            choose your tailor 
            <br />
            bespoke
         </div>

      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* THE 50/50 SPLIT SECTION */}
        {/* grid-cols-1 on mobile, grid-cols-2 on large screens (50/50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: FLASH SALES */}
          <ProductSection 
            title="Flash Sales" 
            align="center" // Center the title as requested
            className="bg-white p-4 rounded-xl shadow-sm h-full"
          >
            <ProductGrid 
              products={flashSaleProducts} 
              columns={SPLIT_SECTION_COLUMNS} 
              gap="tight" // Tight gap looks better when squeezing 3 cols into half screen
            />
          </ProductSection>

          {/* RIGHT: TOP TRENDS */}
          <ProductSection 
            title="Top Trends" 
            align="center"
            className="bg-white p-4 rounded-xl shadow-sm h-full"
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
           <ProductGrid products={interestProducts} columns={5} />
        </ProductSection>

      </div>
    </div>
  );
};

export default Home;
