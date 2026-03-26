import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryMenu = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const timeoutRef = useRef(null);

  // 🔥 THE SHIELD: Guarantee this is always an array, no matter what the API sends
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Pre-select the first category so the right panel is never empty on open
  useEffect(() => {
    if (safeCategories.length > 0 && !activeCategory) {
      setActiveCategory(safeCategories[0]);
    }
  }, [safeCategories, activeCategory]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* TRIGGER BUTTON */}
      <div className="flex items-center gap-1.5 py-4 cursor-pointer group h-full">
        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
          Browse Categories
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 group-hover:text-blue-600 transition-transform duration-300 ${
            isOpen ? '-rotate-180' : ''
          }`}
        />
        <div className="absolute top-[80%] left-0 w-full h-6 bg-transparent" />
      </div>

      {/* MEGA MENU DROPDOWN */}
      <div
        className={`absolute top-full left-0 w-[850px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 rounded-2xl overflow-hidden flex min-h-[450px] transition-all duration-300 origin-top-left ${
          isOpen
            ? 'opacity-100 visible scale-100'
            : 'opacity-0 invisible scale-95'
        }`}
      >
        {/* LEFT COLUMN: Main Categories */}
        <div className="w-64 bg-gray-50/80 border-r border-gray-100 py-4 flex flex-col">
          {/* 🔥 Use safeCategories here */}
          {safeCategories.length > 0 ? (
            safeCategories.map((cat) => (
              <div
                key={cat.slug}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 ${
                  activeCategory?.slug === cat.slug
                    ? 'bg-white text-blue-700 border-l-4 border-blue-600 shadow-[2px_0_10px_rgba(0,0,0,0.02)] relative z-10'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                }`}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="font-bold text-sm block flex-grow"
                >
                  {cat.name}
                </Link>
                {activeCategory?.slug === cat.slug && (
                  <ChevronRight size={16} className="text-blue-600 shrink-0" />
                )}
              </div>
            ))
          ) : (
             <div className="px-6 py-4 text-sm text-gray-500 font-medium">
               Loading categories...
             </div>
          )}
        </div>

        {/* CENTER COLUMN: Subcategories */}
        <div className="flex-1 p-8 bg-white overflow-y-auto max-h-[600px]">
          {activeCategory ? (
            <div className="h-full">
              {/* Active Category Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {activeCategory.name}
                </h3>
                <Link
                  to={`/category/${activeCategory.slug}`}
                  className="group flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide transition-colors"
                >
                  Shop All{' '}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Subcategories Grid */}
              {/* 🔥 Optional Chaining added to activeCategory.children just in case */}
              {activeCategory.children?.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  {activeCategory.children.map((subCat) => (
                    <div key={subCat.slug} className="break-inside-avoid">
                      <Link
                        to={`/category/${subCat.slug}`}
                        className="font-bold text-gray-900 text-sm mb-3 block hover:text-blue-600 transition-colors"
                      >
                        {subCat.name}
                      </Link>
                      {subCat.children && (
                        <ul className="space-y-2.5">
                          {subCat.children.map((child) => (
                            <li key={child.slug}>
                              <Link
                                to={`/category/${child.slug}`}
                                className="text-sm font-medium text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all inline-block"
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
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                  <p className="font-medium">
                    Discover premium items in {activeCategory.name}
                  </p>
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all"
                  >
                    Explore Collection
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
              Hover over a category to explore
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Promotional Banner */}
        <div className="w-56 bg-gray-50 p-6 flex flex-col justify-end relative overflow-hidden border-l border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50" />
          <div className="relative z-10">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <Zap size={16} />
            </div>
            <h4 className="text-lg font-black text-gray-900 leading-tight mb-2">
              New Arrivals in {activeCategory?.name || 'Store'}
            </h4>
            <p className="text-xs font-medium text-gray-600 mb-6">
              Discover the latest premium additions to our catalog.
            </p>
            <Link
              to={`/category/${activeCategory?.slug || ''}`}
              className="inline-block w-full text-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;