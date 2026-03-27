import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const CategoryBar = () => {
  const { categories: allCategories, loading } = useCategories();

  const categories = useMemo(() => {
    if (!Array.isArray(allCategories)) return [];
    return allCategories.filter(
      (cat) => !cat.parent && !cat.parentId && !cat.parentSlug
    );
  }, [allCategories]);

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-100 mb-3 sm:mb-8">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                <div className="w-12 h-12 sm:w-[72px] sm:h-[72px] bg-gray-100 rounded-full" />
                <div className="w-10 h-2 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 mb-3 sm:mb-8">
      {/* Mobile padding drastically reduced (py-2.5) */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-1 items-start snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {categories.map((category, i) => (
            <Link
              key={category.id || category.slug}
              to={`/category/${category.slug}`}
              className="group flex flex-col items-center w-14 sm:w-[72px] flex-none cursor-pointer snap-start"
              title={category.name}
              style={{
                animation: 'catFadeIn 0.4s ease both',
                animationDelay: `${i * 50}ms`,
              }}
            >
              {/* Image Size compressed on mobile: w-12 h-12 */}
              <div className="relative w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-full p-[2px] bg-gray-100 group-hover:bg-gradient-to-tr group-hover:from-green-500 group-hover:to-emerald-300 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center relative">

                  {category.imageUrl ? (
                    <img
                      src={`${category.imageUrl}?auto=format&fit=crop&w=144&q=80`}
                      alt={category.name}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out will-change-transform"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-green-400 ${
                      category.imageUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    <Layers size={16} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                  </div>

                </div>
              </div>

              <span className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-bold text-gray-500 group-hover:text-green-700 transition-colors text-center w-full truncate px-1 leading-tight">
                {category.name}
              </span>
            </Link>
          ))}

        </div>
      </div>

      <style>{`
        @keyframes catFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CategoryBar;