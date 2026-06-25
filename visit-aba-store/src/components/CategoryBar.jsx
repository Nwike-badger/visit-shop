import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import api from '../api/axiosConfig';

// ─── Legacy exports (kept so existing imports don't break) ───────────────────
export const CAT_BAR_CONFIG_KEY   = 'waylchub_cat_bar_config';
export const defaultCatBarConfig  = () => ({
  parentSlug: null, mode: 'PARENT', depth: null,
  order: [], imageOverrides: {}, hiddenSlugs: [],
});
export const loadCatBarConfig = () => defaultCatBarConfig();

// ─── Tree helpers ─────────────────────────────────────────────────────────────
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

const collectLeaves = (nodes, out = []) => {
  for (const n of nodes) {
    if (n.children?.length) collectLeaves(n.children, out);
    else out.push(n);
  }
  return out;
};

const collectAtDepth = (nodes, targetDepth, currentDepth = 0, out = []) => {
  for (const n of nodes) {
    if (currentDepth === targetDepth) out.push(n);
    else if (n.children?.length)
      collectAtDepth(n.children, targetDepth, currentDepth + 1, out);
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
      className="group flex flex-col items-center w-[88px] sm:w-[110px] flex-none cursor-pointer snap-start"
      title={category.name}
      style={{
        animation:      'catFadeIn 0.4s ease both',
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* ── Circle ── */}
      <div className="
        relative
        w-[80px] h-[80px]
        sm:w-[100px] sm:h-[100px]
        rounded-full p-[2.5px]
        bg-gray-100
        group-hover:bg-gradient-to-tr group-hover:from-green-500 group-hover:to-emerald-300
        transition-all duration-300
        shadow-sm
      ">
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
              <Layers size={22} className="sm:w-7 sm:h-7" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>

      {/* ── Label — wraps to 2 lines, no truncation ── */}
      <span className="
        mt-2 sm:mt-2.5
        text-[12px] sm:text-[13px]
        font-bold
        text-gray-600
        group-hover:text-green-700
        transition-colors
        text-center
        w-full
        leading-tight
        line-clamp-2
        px-0.5
      ">
        {category.name}
      </span>
    </Link>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryBar = () => {
  const { categories: allCategories, loading } = useCategories();
  const [serverConfig, setServerConfig] = useState(undefined);

  useEffect(() => {
    api.get('/v1/config/cat-bar')
      .then(res => {
        setServerConfig({
          parentSlug:     res.data?.catBarParentSlug    ?? null,
          mode:           res.data?.catBarMode           ?? 'PARENT',
          depth:          res.data?.catBarDepth          ?? null,
          order:          res.data?.catBarOrder          ?? [],
          hidden:         res.data?.catBarHidden         ?? [],
          imageOverrides: res.data?.catBarImageOverrides ?? {},
        });
      })
      .catch(() => {
        setServerConfig({
          parentSlug: null, mode: 'PARENT', depth: null,
          order: [], hidden: [], imageOverrides: {},
        });
      });
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(allCategories) || serverConfig === undefined) return [];

    const { parentSlug, mode, depth, order, hidden } = serverConfig;
    let pool;

    if (mode === 'LEAVES') {
      pool = collectLeaves(allCategories);
    } else if (mode === 'DEPTH') {
      pool = collectAtDepth(allCategories, depth ?? 1);
    } else {
      if (!parentSlug) {
        pool = allCategories.filter(c => !c.parent && !c.parentId && !c.parentSlug);
      } else {
        const parent = findNodeBySlug(allCategories, parentSlug);
        pool = parent?.children ?? [];
      }
    }

    const hiddenSet = new Set(hidden ?? []);
    pool = pool.filter(c => !hiddenSet.has(c.slug));

    if ((order ?? []).length > 0) {
      const orderMap = new Map(order.map((slug, i) => [slug, i]));
      pool = [...pool].sort(
        (a, b) => (orderMap.get(a.slug) ?? 9999) - (orderMap.get(b.slug) ?? 9999)
      );
    }

    return pool;
  }, [allCategories, serverConfig]);

  // ── Skeleton ──
  if (loading || serverConfig === undefined) {
    return (
      <div className="bg-white border-b border-gray-100 mb-3 sm:mb-8">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 shrink-0 animate-pulse">
                <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-gray-100 rounded-full" />
                <div className="w-14 h-2.5 bg-gray-100 rounded-full" />
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
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="
          flex gap-3 sm:gap-5
          overflow-x-auto pb-2
          items-start
          snap-x snap-mandatory
          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        ">
          {categories.map((category, i) => (
            <CategoryItem
              key={category.id || category.slug}
              category={category}
              index={i}
              imageOverride={serverConfig.imageOverrides?.[category.slug] ?? null}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes catFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
};

export default CategoryBar;