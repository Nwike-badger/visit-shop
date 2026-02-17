import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryMenu = ({ categories = [] }) => { // ✅ Default to empty array
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const handleMouseEnter = () => {
    setIsOpen(true);
    // If no category is active yet, set the first one automatically
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  };

  return (
    <div 
      className="relative z-50"
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 1. THE TRIGGER AREA */}
      <div 
        onMouseEnter={handleMouseEnter}
        className="flex items-center gap-1.5 py-4 cursor-pointer group"
      >
        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
          Categories
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 group-hover:text-blue-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
        
        {/* Invisible Bridge: Prevents menu closing when moving mouse from text to dropdown */}
        <div className="absolute top-full left-0 w-32 h-2 bg-transparent"></div>
      </div>

      {/* 2. THE MEGA MENU CONTAINER */}
      {isOpen && (
        <div className="absolute top-[calc(100%-5px)] left-0 w-[800px] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 rounded-lg overflow-hidden flex min-h-[400px]">
          
          {/* LEFT COLUMN: Main Categories (Sidebar) */}
          <div className="w-64 bg-gray-50 border-r border-gray-100 py-3">
            {categories.map((cat) => (
              <div 
                key={cat.slug} 
                onMouseEnter={() => setActiveCategory(cat)}
                className={`
                  flex items-center justify-between px-5 py-3 cursor-pointer transition-all
                  ${activeCategory?.slug === cat.slug 
                    ? "bg-white text-blue-600 border-l-4 border-blue-600 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"}
                `}
              >
                <Link to={`/category/${cat.slug}`} className="font-medium text-sm block flex-grow">
                  {cat.name}
                </Link>
                {activeCategory?.slug === cat.slug && (
                  <ChevronRight size={14} className="text-blue-600" />
                )}
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Subcategories (The "Mega" Part) */}
          <div className="flex-1 p-8 bg-white">
            {activeCategory ? (
              <div className="h-full">
                {/* Header for the Right Side */}
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {activeCategory.name}
                  </h3>
                  <Link 
                    to={`/category/${activeCategory.slug}`} 
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                  >
                    See all {activeCategory.name} &rarr;
                  </Link>
                </div>

                {/* The Grid Content */}
                {activeCategory.children && activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    {activeCategory.children.map((subCat) => (
                      <div key={subCat.slug} className="break-inside-avoid">
                        {/* Level 2 Header */}
                        <Link 
                          to={`/category/${subCat.slug}`}
                          className="font-bold text-gray-900 text-sm mb-2 block hover:text-blue-600"
                        >
                          {subCat.name}
                        </Link>
                        
                        {/* Level 3 List */}
                        {subCat.children && (
                          <ul className="space-y-1.5">
                            {subCat.children.map((child) => (
                              <li key={child.slug}>
                                <Link 
                                  to={`/category/${child.slug}`}
                                  className="text-sm text-gray-500 hover:text-blue-500 hover:underline transition-colors block"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p>Browse all products in {activeCategory.name}</p>
                    <Link 
                       to={`/category/${activeCategory.slug}`}
                       className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-700 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              // Fallback if nothing selected (rare)
              <div className="flex items-center justify-center h-full text-gray-400">
                Hover over a category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;