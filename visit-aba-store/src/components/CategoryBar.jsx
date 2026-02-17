import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig'; // ✅ Use your configured API instance

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        
        const response = await api.get('/categories/featured'); 
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // ... (Keep your Skeleton Loader exactly as is) ...

  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm mb-8 sticky top-0 opacity-95 backdrop-blur-sm z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide snap-x items-start">
          
          {categories.map((category) => (
            <Link 
              key={category.id || category.slug} 
              to={`/category/${category.slug}`}
              className="group flex flex-col items-center w-20 md:w-24 flex-none cursor-pointer snap-start"
              title={category.name}
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] border-2 border-transparent group-hover:border-blue-600 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    // ✅ Safety check for imageUrl
                    src={category.imageUrl ? category.imageUrl : "https://via.placeholder.com/150"} 
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150"; 
                    }}
                  />
                </div>
              </div>

              <span className="mt-2 text-xs md:text-sm font-medium text-gray-600 group-hover:text-blue-700 transition-colors text-center w-full truncate px-1">
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