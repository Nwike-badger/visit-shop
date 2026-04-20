import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

// ─── Config helpers (shared with CategoryBarSettings) ────────────────────────
export const CAT_BAR_CONFIG_KEY = 'waylchub_cat_bar_config';

export const defaultCatBarConfig = () => ({
  parentSlug:     null,  // null = root level, else show children of this slug
  order:          [],    // explicit ordering array of slugs; unlisted slugs come after
  imageOverrides: {},    // { [slug]: string }  — admin-set image URLs
  hiddenSlugs:    [],    // slugs to exclude from the bar
});

export const loadCatBarConfig = () => {
  try {
    const raw = localStorage.getItem(CAT_BAR_CONFIG_KEY);
    return raw ? { ...defaultCatBarConfig(), ...JSON.parse(raw) } : defaultCatBarConfig();
  } catch {
    return defaultCatBarConfig();
  }
};

// ─── Find a node anywhere in the tree ────────────────────────────────────────
const findNodeBySlug = (nodes, slug) => {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    if (n.children?.length) {
      const found = findNodeBySlug(n.children, slug);
      if (found) return found;
    }
  }
  return null;
};

// ─── CategoryItem ─────────────────────────────────────────────────────────────
const CategoryItem = ({ category, index, imageOverride }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imageOverride || category.imageUrl || null;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group flex flex-col items-center w-14 sm:w-[72px] flex-none cursor-pointer snap-start"
      title={category.name}
      style={{
        animation:      'catFadeIn 0.4s ease both',
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-full p-[2px] bg-gray-100 group-hover:bg-gradient-to-tr group-hover:from-green-500 group-hover:to-emerald-300 transition-all duration-300">
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center relative">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={category.name}
              loading={index < 4 ? 'eager' : 'lazy'}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out will-change-transform"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-green-400">
              <Layers size={16} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>

      <span className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-bold text-gray-500 group-hover:text-green-700 transition-colors text-center w-full truncate px-1 leading-tight">
        {category.name}
      </span>
    </Link>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryBar = () => {
  const { categories: allCategories, loading } = useCategories();
  const [config, setConfig] = useState(loadCatBarConfig);

  // Re-read config whenever admin saves new settings
  useEffect(() => {
    const handler = () => setConfig(loadCatBarConfig());
    window.addEventListener('cat_bar_config_updated', handler);
    return () => window.removeEventListener('cat_bar_config_updated', handler);
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(allCategories)) return [];

    // 1. Determine which pool of categories to show
    let pool;
    if (!config.parentSlug) {
      // Default: root-level only (original behaviour)
      pool = allCategories.filter(
        (cat) => !cat.parent && !cat.parentId && !cat.parentSlug,
      );
    } else {
      // Show children of the configured parent slug
      const parent = findNodeBySlug(allCategories, config.parentSlug);
      pool = parent?.children ?? [];
    }

    // 2. Remove admin-hidden slugs
    const hidden = new Set(config.hiddenSlugs ?? []);
    pool = pool.filter((c) => !hidden.has(c.slug));

    // 3. Apply explicit ordering (pinned slugs first, unlisted follow)
    if ((config.order ?? []).length > 0) {
      const orderMap = new Map(config.order.map((slug, i) => [slug, i]));
      pool = [...pool].sort((a, b) => {
        const ai = orderMap.has(a.slug) ? orderMap.get(a.slug) : 9999;
        const bi = orderMap.has(b.slug) ? orderMap.get(b.slug) : 9999;
        return ai - bi;
      });
    }

    return pool;
  }, [allCategories, config]);

  // ── Loading skeleton ──
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

  if (!categories.length) return null;

  return (
    <div className="bg-white border-b border-gray-100 mb-3 sm:mb-8">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-1 items-start snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((category, i) => (
            <CategoryItem
              key={category.id || category.slug}
              category={category}
              index={i}
              imageOverride={config.imageOverrides?.[category.slug] ?? null}
            />
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