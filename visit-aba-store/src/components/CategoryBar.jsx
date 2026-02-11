import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure this matches your Spring Boot context path exactly
  const BASE_URL = "http://localhost:8080/api/categories"; 

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/featured`);
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-100 mb-8 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-20 md:w-24 flex-none animate-pulse">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100"></div>
                <div className="h-3 w-12 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm mb-8 sticky  opacity-95 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Scroll Container */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide snap-x items-start">
          
          {categories.map((category) => (
            <Link 
              key={category.id || category.slug} 
              to={`/category/${category.slug}`}
              // FIXED WIDTH HERE: w-20 (mobile) and w-24 (desktop)
              // 'flex-none' prevents the browser from squishing items if space is tight
              className="group flex flex-col items-center w-20 md:w-24 flex-none cursor-pointer snap-start"
              title={category.name} // Tooltip shows full text on hover
            >
              {/* Image Container */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] border-2 border-transparent group-hover:border-purple-600 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src={category.imageUrl || "https://via.placeholder.com/150"} 
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150"; 
                    }}
                  />
                </div>
              </div>

              {/* Text Label - TRUNCATED */}
              <span className="mt-2 text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-700 transition-colors text-center w-full truncate px-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;