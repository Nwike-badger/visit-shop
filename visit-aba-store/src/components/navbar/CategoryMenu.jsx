import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryMenu = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setActiveCategory(null);
      }}
    >
      {/* Trigger Button */}
      <button className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 cursor-pointer shrink-0 py-4">
        Categories <ChevronDown size={16} />
      </button>

      {/* Main Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-64 bg-white shadow-xl border rounded-lg py-2 z-50">
          {categories.map((cat) => (
            <div 
              key={cat.slug} 
              className="group relative px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              onMouseEnter={() => setActiveCategory(cat)}
            >
              <Link to={`/category/${cat.slug}`} className="text-sm text-gray-700 font-medium flex-grow">
                {cat.name}
              </Link>
              {cat.children && cat.children.length > 0 && (
                <ChevronRight size={14} className="text-gray-400" />
              )}

              {/* Sub-Category Flyout (Level 2 & 3) */}
              {activeCategory?.slug === cat.slug && cat.children?.length > 0 && (
                <div className="absolute left-full top-0 ml-1 w-64 bg-white shadow-xl border rounded-lg py-2 min-h-full">
                  <div className="px-4 pb-2 border-b mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{cat.name}</span>
                  </div>
                  {cat.children.map((subCat) => (
                    <div key={subCat.slug} className="px-4 py-1.5">
                      <Link to={`/category/${subCat.slug}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 block">
                        {subCat.name}
                      </Link>
                      {/* Level 3 Links */}
                      {subCat.children && (
                        <div className="ml-2 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-2">
                          {subCat.children.map(child => (
                             <Link key={child.slug} to={`/category/${child.slug}`} className="text-xs text-gray-500 hover:text-blue-600">
                               {child.name}
                             </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;