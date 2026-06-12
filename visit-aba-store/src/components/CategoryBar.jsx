import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import api from '../api/axiosConfig';

// ─── Config helpers (shared with CategoryBarSettings) ────────────────────────
export const CAT_BAR_CONFIG_KEY = 'waylchub_cat_bar_config';

export const defaultCatBarConfig = () => ({
  parentSlug:     null,
  order:          [],
  imageOverrides: {},
  hiddenSlugs:    [],
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

// ─── Collect all LEAF categories (no children) anywhere in the tree ──────────
// These are the categories "closest to the product" — gathered across ALL roots.
const collectLeaves = (nodes, out = []) => {
  for (const n of nodes) {
    if (n.children?.length) collectLeaves(n.children, out);
    else out.push(n);
  }
  return out;
};

// ─── Collect all categories at an exact depth ────────────────────────────────
// depth 0 = roots, 1 = their children, 2 = grandchildren, etc.
const collectAtDepth = (nodes, targetDepth, currentDepth = 0, out = []) => {
  for (const n of nodes) {
    if (currentDepth === targetDepth) out.push(n);
    else if (n.children?.length) collectAtDepth(n.children, targetDepth, currentDepth + 1, out);
  }
  return out;
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

  // Server config drives how the bar is populated. undefined = not yet loaded.
  // Shape: { parentSlug, mode, depth }
  const [serverConfig, setServerConfig] = useState(undefined);

  // Fetch authoritative cat-bar config from backend on mount
  useEffect(() => {
    api.get('/v1/config/cat-bar')
      .then(res => {
        setServerConfig({
          parentSlug: res.data?.catBarParentSlug ?? null,
          mode:       res.data?.catBarMode ?? 'PARENT',
          depth:      res.data?.catBarDepth ?? null,
        });
        // Keep localStorage parentSlug in sync as a fast cache on next visit
        setConfig(prev => ({ ...prev, parentSlug: res.data?.catBarParentSlug ?? null }));
      })
      .catch(() => {
        // Fall back to localStorage silently on network error (PARENT mode)
        setServerConfig({
          parentSlug: loadCatBarConfig().parentSlug ?? null,
          mode:       'PARENT',
          depth:      null,
        });
      });
  }, []);

  // Re-read order/hidden/imageOverrides from localStorage when admin saves
  useEffect(() => {
    const handler = () => setConfig(loadCatBarConfig());
    window.addEventListener('cat_bar_config_updated', handler);
    return () => window.removeEventListener('cat_bar_config_updated', handler);
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(allCategories) || serverConfig === undefined) return [];

    const { parentSlug, mode, depth } = serverConfig;
    let pool;

    if (mode === 'LEAVES') {
      // Bottom-level categories from across the whole tree (closest to product)
      pool = collectLeaves(allCategories);
    } else if (mode === 'DEPTH') {
      // Everything at an exact depth (0 = roots, 1 = their children, ...)
      pool = collectAtDepth(allCategories, depth ?? 1);
    } else {
      // PARENT mode (default): direct children of the configured parent,
      // or root categories when no parent is set.
      if (!parentSlug) {
        pool = allCategories.filter(
          (cat) => !cat.parent && !cat.parentId && !cat.parentSlug,
        );
      } else {
        const parent = findNodeBySlug(allCategories, parentSlug);
        pool = parent?.children ?? [];
      }
    }

    // Remove admin-hidden slugs
    const hidden = new Set(config.hiddenSlugs ?? []);
    pool = pool.filter((c) => !hidden.has(c.slug));

    // Apply explicit ordering (pinned slugs first, unlisted follow)
    if ((config.order ?? []).length > 0) {
      const orderMap = new Map(config.order.map((slug, i) => [slug, i]));
      pool = [...pool].sort((a, b) => {
        const ai = orderMap.has(a.slug) ? orderMap.get(a.slug) : 9999;
        const bi = orderMap.has(b.slug) ? orderMap.get(b.slug) : 9999;
        return ai - bi;
      });
    }

    return pool;
  }, [allCategories, config, serverConfig]);

  // Show skeleton while categories are loading OR server config hasn't arrived yet
  if (loading || serverConfig === undefined) {
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