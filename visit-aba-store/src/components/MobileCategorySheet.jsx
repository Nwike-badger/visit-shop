import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Layers, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileCategorySheet = ({ categories = [], isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Clear search when closed
      setTimeout(() => setSearchQuery(''), 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Flat list: top-level + any named children for search
  const allCategories = useMemo(() => {
    const flat = [];
    categories.forEach((cat) => {
      flat.push(cat);
      if (cat.children?.length) {
        cat.children.forEach((child) => flat.push({ ...child, _isChild: true, _parentName: cat.name }));
      }
    });
    return flat;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories; // Top-level only when no search
    const q = searchQuery.toLowerCase();
    return allCategories.filter((c) =>
      c.name?.toLowerCase().includes(q) || c._parentName?.toLowerCase().includes(q)
    );
  }, [searchQuery, categories, allCategories]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      {/* ── BACKDROP ──────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── BOTTOM SHEET PANEL ────────────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] flex flex-col bg-white rounded-t-3xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '92dvh', minHeight: '60dvh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Browse Categories</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {filtered.length} {isSearching ? 'results' : 'categories'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors active:scale-95"
            aria-label="Close categories"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* ── SEARCH BAR ──────────────────────────────────────────────────── */}
        <div className="px-5 pb-4 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 placeholder:text-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
        <div className="h-px bg-gray-100 mx-5 shrink-0" />

        {/* ── SCROLLABLE CATEGORY GRID ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-500 text-sm">No categories found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : isSearching ? (
            /* Search results — list style for context */
            <div className="space-y-1">
              {filtered.map((cat, i) => (
                <Link
                  key={cat.id || cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 active:bg-green-100 transition-colors group"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {cat.imageUrl ? (
                      <img
                        src={`${cat.imageUrl}?auto=format&fit=crop&w=80&q=70`}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                        <Layers size={16} className="text-green-400" />
                      </div>
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{cat.name}</p>
                    {cat._parentName && (
                      <p className="text-[10px] text-gray-400 font-medium">in {cat._parentName}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            /* Default: 3-column grid of top-level categories */
            <div className="grid grid-cols-3 gap-x-3 gap-y-6">
              {filtered.map((cat, i) => (
                <Link
                  key={cat.id || cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="group flex flex-col items-center gap-2.5"
                  style={{
                    animation: 'fadeSlideUp 0.4s ease both',
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Circle image with green hover ring */}
                  <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gray-100 group-hover:bg-gradient-to-tr group-hover:from-green-500 group-hover:to-emerald-300 group-active:scale-95 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border-2 border-white shadow-sm relative">
                      {cat.imageUrl ? (
                        <img
                          src={`${cat.imageUrl}?auto=format&fit=crop&w=160&q=80`}
                          alt={cat.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-green-400 ${
                          cat.imageUrl ? 'hidden' : 'flex'
                        }`}
                      >
                        <Layers size={22} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Subcategory count badge */}
                    {cat.children?.length > 0 && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cat.children.length}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-gray-600 group-hover:text-green-700 text-center leading-tight transition-colors line-clamp-2 px-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default MobileCategorySheet;