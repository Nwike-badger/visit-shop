import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryMenu = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const timeoutRef = useRef(null);

  const safeCategories = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    if (safeCategories.length > 0 && !activeCategory) {
      setActiveCategory(safeCategories[0]);
    }
  }, [safeCategories, activeCategory]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleMouseEnter = () => { clearTimeout(timeoutRef.current); setIsOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 150); };

  return (
    <div className="relative z-50" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

      {/* ── TRIGGER ─────────────────────────────────────────────────────── */}
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all duration-200 group"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors whitespace-nowrap">
          Browse Categories
        </span>
        <ChevronDown
          size={15}
          className={`text-gray-400 group-hover:text-green-600 transition-all duration-300 ${isOpen ? '-rotate-180' : ''}`}
        />
      </button>

      {/* Invisible bridge — prevents gap from closing the menu */}
      <div className="absolute top-full left-0 w-full h-3 bg-transparent" />

      {/* ── MEGA MENU ───────────────────────────────────────────────────── */}
      <div
        className={`absolute top-[calc(100%+12px)] left-0 w-[820px] flex min-h-[420px] max-h-[520px]
          rounded-2xl overflow-hidden
          border border-gray-200/80
          shadow-[0_24px_64px_-12px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.03)]
          transition-all duration-200 origin-top-left
          ${isOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-[0.97] -translate-y-2'}`}
      >

        {/* LEFT: Category list */}
        <div className="w-58 bg-gray-50 border-r border-gray-200/60 py-3 flex flex-col shrink-0 overflow-y-auto" style={{width:'232px'}}>
          <p className="px-5 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">All Categories</p>
          {safeCategories.length > 0 ? safeCategories.map((cat) => {
            const isActive = activeCategory?.slug === cat.slug;
            return (
              <div
                key={cat.slug}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-white shadow-sm border border-gray-200/80 text-green-700'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 transition-all ${isActive ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}>
                  {cat.imageUrl ? (
                    <img src={`${cat.imageUrl}?auto=format&fit=crop&w=64&q=70`} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                      <Layers size={14} className="text-green-600" />
                    </div>
                  )}
                </div>
                <Link to={`/category/${cat.slug}`} className="font-bold text-sm flex-grow truncate">{cat.name}</Link>
                {isActive && <ChevronRight size={14} className="text-green-500 shrink-0" />}
              </div>
            );
          }) : (
            <div className="px-5 py-4 text-sm text-gray-400">Loading...</div>
          )}
        </div>

        {/* CENTER: Subcategories */}
        <div className="flex-1 bg-white overflow-y-auto p-7">
          {activeCategory ? (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{activeCategory.name}</h3>
                  {activeCategory.children?.length > 0 && (
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{activeCategory.children.length} subcategories</p>
                  )}
                </div>
                <Link to={`/category/${activeCategory.slug}`} className="group flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-800 uppercase tracking-wide transition-colors">
                  Shop All <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {activeCategory.children?.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-10 gap-y-7">
                  {activeCategory.children.map((subCat) => (
                    <div key={subCat.slug}>
                      <Link to={`/category/${subCat.slug}`} className="font-black text-gray-800 text-sm mb-2.5 block hover:text-green-600 transition-colors">
                        {subCat.name}
                      </Link>
                      {subCat.children?.length > 0 && (
                        <ul className="space-y-2">
                          {subCat.children.map((child) => (
                            <li key={child.slug}>
                              <Link to={`/category/${child.slug}`} className="text-sm text-gray-500 hover:text-green-600 hover:translate-x-1 transition-all inline-block font-medium">
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-sm">
                    {activeCategory.imageUrl ? (
                      <img src={`${activeCategory.imageUrl}?auto=format&fit=crop&w=128&q=80`} alt={activeCategory.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                        <Layers size={22} className="text-green-600" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-gray-600 text-sm mb-1">Explore {activeCategory.name}</p>
                  <p className="text-xs text-gray-400 mb-5">Discover premium items</p>
                  <Link to={`/category/${activeCategory.slug}`} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 hover:shadow-lg hover:shadow-green-200/60 transition-all">
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
              Hover a category to explore
            </div>
          )}
        </div>

        {/* RIGHT: Dark promo panel */}
        <div className="w-52 bg-gray-900 p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Zap size={18} className="text-white" />
            </div>
            <h4 className="text-base font-black text-white leading-snug mb-2 tracking-tight">
              New in {activeCategory?.name || 'Store'}
            </h4>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">
              Fresh arrivals from Nigeria's top artisans and brands.
            </p>
          </div>

          <div className="relative z-10 mt-6">
            <Link
              to={`/category/${activeCategory?.slug || ''}`}
              className="block w-full text-center px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl text-sm font-bold text-white transition-all"
            >
              Explore Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;