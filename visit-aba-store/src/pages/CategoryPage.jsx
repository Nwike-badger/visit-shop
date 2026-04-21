import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal, ChevronRight, X, Search, Package,
  ChevronDown, Layers, LayoutGrid, LayoutList, ArrowLeft, Loader2
} from 'lucide-react';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'relevance',   label: 'Most Relevant'   },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First'     },
  { value: 'popular',    label: 'Best Selling'     },
];

const PAGE_SIZE = 20;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ProductSkeleton = ({ layout }) => {
  if (layout === 'list') {
    return (
      <div className="flex gap-5 bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
        <div className="w-36 h-36 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 py-1 space-y-3">
          <div className="h-3 bg-gray-100 rounded-full w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-3/4" />
          <div className="h-4 bg-gray-100 rounded-full w-1/2" />
          <div className="h-8 bg-gray-100 rounded-xl w-32 mt-4" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="p-3 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-20" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="h-5 bg-gray-100 rounded-full w-28 mt-2" />
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──
  const [category, setCategory]           = useState(null);
  const [breadcrumbs, setBreadcrumbs]     = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts]           = useState([]);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingCat, setLoadingCat]       = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filtersOpen, setFiltersOpen]     = useState(false);
  const [layout, setLayout]               = useState('grid');

  // Filter state — synced from URL params
  const page     = parseInt(searchParams.get('page') || '0', 10);
  const sort     = searchParams.get('sort') || 'relevance';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const keyword  = searchParams.get('q') || '';

  const [priceInput, setPriceInput] = useState({ min: minPrice, max: maxPrice });
  const topRef = useRef(null);

  // ── Fetch category info ──
  useEffect(() => {
    setLoadingCat(true);
    setCategory(null);
    setBreadcrumbs([]);
    setSubcategories([]);

    api.get(`/categories/tree`)
      .then(res => {
        const found = findInTree(res.data, slug, []);
        if (found) {
          setCategory(found.node);
          setBreadcrumbs(found.path);
          setSubcategories(found.node.children || []);
        }
      })
      .catch(() => toast.error("Couldn't load category info."))
      .finally(() => setLoadingCat(false));
  }, [slug]);

  // ── Fetch products ──
  useEffect(() => {
    setLoadingProducts(true);
    if (page > 0) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const sortMap = {
      price_asc:  'price,asc',
      price_desc: 'price,desc',
      newest:     'createdAt,desc',
      popular:    'soldCount,desc',
    };

    const hasFilters = keyword || minPrice || maxPrice;

    if (hasFilters) {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (sortMap[sort]) params.set('sort', sortMap[sort]);

      api.post(`/products/filter?${params.toString()}`, {
        categorySlug: slug,
        keyword:  keyword  || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
        .then(res => {
          setProducts(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        })
        .catch(() => { toast.error("Couldn't load products."); setProducts([]); })
        .finally(() => setLoadingProducts(false));
    } else {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (sortMap[sort]) params.set('sort', sortMap[sort]);

      api.get(`/products/category/${slug}?${params.toString()}`)
        .then(res => {
          setProducts(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        })
        .catch(() => { toast.error("Couldn't load products."); setProducts([]); })
        .finally(() => setLoadingProducts(false));
    }
  }, [slug, page, sort, minPrice, maxPrice, keyword]);

  // ── Helpers ──
  const findInTree = (nodes, targetSlug, path) => {
    for (const node of nodes) {
      const currentPath = [...path, node];
      if (node.slug === targetSlug) return { node, path: currentPath };
      if (node.children?.length) {
        const found = findInTree(node.children, targetSlug, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const applyPriceFilter = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (priceInput.min) next.set('minPrice', priceInput.min); else next.delete('minPrice');
      if (priceInput.max) next.set('maxPrice', priceInput.max); else next.delete('maxPrice');
      next.delete('page');
      return next;
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setPriceInput({ min: '', max: '' });
    setSearchParams({ sort });
  };

  const hasActiveFilters = minPrice || maxPrice || keyword;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50/30 min-h-screen pb-24 font-sans" ref={topRef}>

      {/* ── CATEGORY HERO ─────────────────────────────────────────────── */}
      <div className="relative bg-gray-900 overflow-hidden">
        {category?.imageUrl && (
          <>
            <img
              src={category.imageUrl}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
          </>
        )}
        {!category?.imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-emerald-800/20" />
        )}

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          {!loadingCat && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-5 text-xs font-bold text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.slug}>
                  <ChevronRight size={12} className="text-gray-600" />
                  {i < breadcrumbs.length - 1 ? (
                    <Link to={`/category/${crumb.slug}`} className="hover:text-white transition-colors">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-white">{crumb.name}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {loadingCat ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-8 bg-white/10 rounded-xl w-56" />
              <div className="h-4 bg-white/5 rounded-xl w-80" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {category?.imageUrl ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-xl shrink-0">
                      <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-xl">
                      <Layers size={22} className="text-white" />
                    </div>
                  )}
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {category?.name || slug}
                  </h1>
                </div>
                {category?.description && (
                  <p className="text-gray-400 font-medium max-w-xl text-sm leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
              {!loadingProducts && (
                <div className="shrink-0">
                  <p className="text-gray-400 text-sm font-medium">
                    <span className="text-white font-black text-2xl">{totalElements.toLocaleString()}</span>
                    {' '}product{totalElements !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SUBCATEGORIES STRIP ───────────────────────────────────────── */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/category/${sub.slug}`}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shrink-0 group"
                >
                  {sub.imageUrl && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {sub.name}
                  {sub.children?.length > 0 && (
                    <span className="text-[10px] bg-gray-200 group-hover:bg-green-100 group-hover:text-green-700 text-gray-500 px-1.5 py-0.5 rounded-full font-black transition-colors">
                      {sub.children.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] sm:top-[80px] z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
                ${filtersOpen || hasActiveFilters
                  ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center text-[10px]">
                  {[minPrice, maxPrice, keyword].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-2 py-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold pl-4 pr-8 py-2 rounded-xl outline-none cursor-pointer hover:border-gray-300 transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg transition-all ${layout === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── FILTER PANEL ────────────────────────────────────────────── */}
        <div className={`overflow-hidden transition-all duration-300 border-t border-gray-100 ${filtersOpen ? 'max-h-64' : 'max-h-0'}`}>
          <div className="bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Price Range</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₦</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceInput.min}
                      onChange={(e) => setPriceInput(p => ({ ...p, min: e.target.value }))}
                      className="w-32 pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 bg-white"
                    />
                  </div>
                  <span className="text-gray-400 font-bold text-sm">to</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₦</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceInput.max}
                      onChange={(e) => setPriceInput(p => ({ ...p, max: e.target.value }))}
                      className="w-32 pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 bg-white"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Search in Category</p>
                <form onSubmit={(e) => { e.preventDefault(); updateParam('q', e.target.q.value); }} className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="q"
                      type="text"
                      defaultValue={keyword}
                      placeholder="Search products..."
                      className="w-52 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 bg-white"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors">
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {keyword && (
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                "{keyword}"
                <button onClick={() => updateParam('q', '')} className="hover:text-green-900 ml-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                ₦{minPrice || '0'} – {maxPrice ? `₦${maxPrice}` : 'Any'}
                <button
                  onClick={() => {
                    setPriceInput({ min: '', max: '' });
                    setSearchParams(prev => {
                      const n = new URLSearchParams(prev);
                      n.delete('minPrice'); n.delete('maxPrice'); n.delete('page');
                      return n;
                    });
                  }}
                  className="hover:text-green-900 ml-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {loadingProducts ? (
          <div className={layout === 'list'
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4'}>
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <ProductSkeleton key={i} layout={layout} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 mb-6 shadow-sm border border-gray-100">
              <Package size={36} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No products found</h3>
            <p className="text-gray-500 font-medium max-w-sm mb-8">
              {hasActiveFilters
                ? "Try adjusting your filters or search term."
                : "No products have been added to this category yet."}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md">
                Clear Filters
              </button>
            )}
          </div>
        ) : layout === 'list' ? (
          // List layout — render cards individually so they use the shared ProductCard
          // (ProductGrid only does grid; list is a category-page-specific affordance)
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Grid layout — use the shared ProductGrid (same as Home & Catalog)
          <ProductGrid products={products} columns={5} gap="normal" />
        )}

        {/* ── PAGINATION ────────────────────────────────────────────── */}
        {totalPages > 1 && !loadingProducts && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => updateParam('page', String(page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const total = totalPages;
                let pageNum;
                if (total <= 7)           pageNum = i;
                else if (i === 0)         pageNum = 0;
                else if (i === 6)         pageNum = total - 1;
                else if (page <= 3)       pageNum = i;
                else if (page >= total-4) pageNum = total - 7 + i;
                else                      pageNum = page - 3 + i;

                const isEllipsis = total > 7 && (
                  (i === 1 && pageNum > 1) || (i === 5 && pageNum < total - 2)
                );

                if (isEllipsis) return (
                  <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold text-sm">…</span>
                );

                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParam('page', String(pageNum))}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                      ${pageNum === page
                        ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => updateParam('page', String(page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;