import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryBar = () => {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure this matches your Spring Boot context path exactly
  const BASE_URL = "http://localhost:8080/api/categories"; 

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/featured`);
        setFeaturedCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch featured categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) return null; 

  // If api returns empty list, hide the bar entirely
  if (!featuredCategories || featuredCategories.length === 0) return null;

  return (
    <div className="bg-white border-b mb-6">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Categories</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {featuredCategories.map((category) => (
            <Link 
              key={category.id || category.slug} 
              to={`/category/${category.slug}`}
              className="flex flex-col items-center min-w-[80px] group cursor-pointer snap-start"
            >
              <div className="w-20 h-20 rounded-full p-0.5 border-2 border-transparent group-hover:border-blue-600 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  <img 
                    // ✅ FIXED LINE BELOW:
                    // We use a simple OR operator (||) to provide a generic gray placeholder 
                    // ONLY if the database image is null/empty.
                    src={category.imageUrl || "https://via.placeholder.com/150"} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150"; 
                    }}
                  />
                </div>
              </div>

              <span className="mt-3 text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors whitespace-nowrap">
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