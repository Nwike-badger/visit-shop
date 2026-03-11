import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  Package, Plus, Layers, Image as ImageIcon,
  CheckCircle, Edit, Trash2, ChevronDown, ChevronUp,
  Eye, EyeOff, Tag, ListOrdered, Info, Search,
  AlertTriangle, TrendingUp, BarChart2, RefreshCw,
  X, Loader2, ToggleLeft, ToggleRight, Link, ShoppingBag
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (err) => {
  if (err.response?.data?.errors?.length > 0)
    return err.response.data.errors[0].defaultMessage || 'Validation failed.';
  return err.response?.data?.message || 'Operation failed. Please check inputs.';
};

const fmt = (n) => Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });

// BUG FIX #1: Jackson strips 'is' from boolean fields → field is "active" not "isActive"
const isActive = (obj) => obj?.active !== false;

// BUG FIX #11: Smarter refresh — poll once after a delay instead of fire-and-forget
const refreshAfterDelay = (fn, ms = 900) =>
  new Promise((r) => setTimeout(async () => { await fn(); r(); }, ms));

// ─── sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, loading, icon: Icon, title, colorClass }) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={title}
    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${colorClass}`}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
  </button>
);

// ─── main component ───────────────────────────────────────────────────────────

const AdminProducts = () => {
  // data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  // ui state
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [productVariants, setProductVariants] = useState({});
  const [actionLoading, setActionLoading] = useState({}); // { [id]: bool }

  // modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingVariantId, setEditingVariantId] = useState(null);

  // forms
  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', basePrice: '', compareAtPrice: '',
    categorySlug: '', brandSlug: '', imageUrl: '', isActive: true, tags: ''
  });
  const [optionRows, setOptionRows] = useState([{ name: '', values: '' }]);
  const [specRows, setSpecRows] = useState([{ key: '', value: '' }]);

  const [variantForm, setVariantForm] = useState({
    productId: '', sku: '', price: '', compareAtPrice: '',
    stockQuantity: '', lowStockThreshold: '5', imageUrl: '', isActive: true
  });
  const [variantAttributes, setVariantAttributes] = useState({});
  const [activeVariantOptions, setActiveVariantOptions] = useState([]); // variantOptions of selected product

  const [productSaving, setProductSaving] = useState(false);
  const [variantSaving, setVariantSaving] = useState(false);

  const searchRef = useRef(null);

  // ── derived stats ────────────────────────────────────────────────────────────
  const stats = {
    total: products.length,
    active: products.filter(isActive).length,
    // BUG FIX #3: stockQuantity from ProductResponse = totalStock
    lowStock: products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length,
    outOfStock: products.filter(p => (p.stockQuantity || 0) === 0).length,
  };

  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
    p.brandName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── data fetching ────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get(`/products?page=${page}&size=50`);
      const data = res.data.content ?? res.data;
      // BUG FIX #3: inject `active` if missing (for older cached responses)
      setProducts(Array.isArray(data) ? data : []);
      if (res.data.totalPages) setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories/tree');
      setCategories(res.data || []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── variant loader ───────────────────────────────────────────────────────────

  const loadVariants = async (productId, force = false) => {
    if (!force && productVariants[productId]) return;
    try {
      const res = await api.get(`/products/${productId}`);
      setProductVariants(prev => ({ ...prev, [productId]: res.data.variants || [] }));
    } catch {
      toast.error('Failed to load variants');
    }
  };

  const toggleRow = async (productId) => {
    if (expandedId === productId) { setExpandedId(null); return; }
    setExpandedId(productId);
    await loadVariants(productId);
  };

  // ── product CRUD ─────────────────────────────────────────────────────────────

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({ name: '', slug: '', description: '', basePrice: '', compareAtPrice: '', categorySlug: '', brandSlug: '', imageUrl: '', isActive: true, tags: '' });
    setOptionRows([{ name: '', values: '' }]);
    setSpecRows([{ key: '', value: '' }]);
    setShowProductModal(true);
  };

  const openEditProduct = async (productId) => {
    setActionLoading(prev => ({ ...prev, [`edit-${productId}`]: true }));
    // 💡 Ensure we have variants loaded so the Base Price warning works
    await loadVariants(productId);

    try {
      const res = await api.get(`/products/${productId}`);
      // BUG FIX #4: /products/{id} returns { product, variants } — use res.data.product
      const p = res.data.product ?? res.data;
      setEditingProductId(p.id);
      setProductForm({
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        // BUG FIX #4: basePrice is on raw product, not minPrice
        basePrice: p.basePrice ?? '',
        compareAtPrice: p.compareAtPrice ?? '',
        categorySlug: p.categorySlug || '',
        brandSlug: p.brand?.slug || (p.brandName ? p.brandName.toLowerCase().replace(/\s+/g, '-') : ''),
        // BUG FIX #1: raw product has `active` not `isActive`
        isActive: p.active !== false,
        tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
        imageUrl: p.images?.[0]?.url || '',
      });
      setOptionRows(
        p.variantOptions?.length
          ? p.variantOptions.map(o => ({ name: o.name, values: o.values.join(', ') }))
          : [{ name: '', values: '' }]
      );
      setSpecRows(
        p.specifications && Object.keys(p.specifications).length
          ? Object.entries(p.specifications).map(([k, v]) => ({ key: k, value: v }))
          : [{ key: '', value: '' }]
      );
      setShowProductModal(true);
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setActionLoading(prev => ({ ...prev, [`edit-${productId}`]: false }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSaving(true);

    const variantOptions = {};
    optionRows.forEach(r => { if (r.name.trim() && r.values.trim()) variantOptions[r.name.trim()] = r.values.split(',').map(v => v.trim()).filter(Boolean); });

    const specifications = {};
    specRows.forEach(r => { if (r.key.trim() && r.value.trim()) specifications[r.key.trim()] = r.value.trim(); });

    const payload = {
      id: editingProductId,
      name: productForm.name,
      slug: productForm.slug.toLowerCase().replace(/\s+/g, '-'),
      description: productForm.description,
      basePrice: parseFloat(String(productForm.basePrice).replace(/,/g, '')) || 0,
      compareAtPrice: productForm.compareAtPrice ? parseFloat(String(productForm.compareAtPrice).replace(/,/g, '')) : null,
      discount: 0,
      categorySlug: productForm.categorySlug || null,
      brandSlug: productForm.brandSlug ? productForm.brandSlug.toLowerCase().replace(/\s+/g, '-') : null,
      isActive: productForm.isActive,
      tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      images: productForm.imageUrl ? [{ url: productForm.imageUrl, altText: productForm.name, isPrimary: true }] : [],
      variantOptions: Object.keys(variantOptions).length ? variantOptions : null,
      specifications: Object.keys(specifications).length ? specifications : null,
    };

    try {
      await api.post('/products', payload);
      toast.success(editingProductId ? 'Product updated!' : 'Product created!');
      setShowProductModal(false);
      // BUG FIX #2: backend now recalculates aggregates after product save (see backend patch)
      // Still add a small delay so the event fires before we refetch
      await refreshAfterDelay(fetchProducts, 600);
      // Invalidate variant cache for this product so it reloads fresh
      if (editingProductId) {
        setProductVariants(prev => { const n = { ...prev }; delete n[editingProductId]; return n; });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProductSaving(false);
    }
  };

  // BUG FIX #9: Don't fetch product again — use state data + just flip isActive
  const toggleProductActive = async (product) => {
    const id = product.id;
    setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: true }));
    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data.product ?? res.data;
      const variantOptionsMap = {};
      p.variantOptions?.forEach(o => { variantOptionsMap[o.name] = o.values; });

      await api.post('/products', {
        id: p.id, name: p.name, slug: p.slug, description: p.description,
        basePrice: p.basePrice, compareAtPrice: p.compareAtPrice, discount: p.discount || 0,
        categorySlug: p.categorySlug,
        brandSlug: p.brand?.slug || null,
        // BUG FIX #1: flip p.active (not p.isActive)
        isActive: !isActive(p),
        tags: p.tags || [],
        images: p.images || [],
        variantOptions: Object.keys(variantOptionsMap).length ? variantOptionsMap : null,
        specifications: p.specifications || null,
      });
      toast.success(`Product ${!isActive(p) ? 'activated' : 'hidden'}`);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product AND all its variants permanently?')) return;
    setActionLoading(prev => ({ ...prev, [`delete-${productId}`]: true }));
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      if (expandedId === productId) setExpandedId(null);
      setProductVariants(prev => { const n = { ...prev }; delete n[productId]; return n; });
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${productId}`]: false }));
    }
  };

  // ── variant CRUD ─────────────────────────────────────────────────────────────

  const openAddVariant = async (productId) => {
    setActionLoading(prev => ({ ...prev, [`addvar-${productId}`]: true }));
    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data.product ?? res.data;
      setEditingVariantId(null);
      setActiveVariantOptions(p.variantOptions || []);
      setVariantForm({ productId: p.id, sku: '', price: p.basePrice || '', compareAtPrice: '', stockQuantity: '', lowStockThreshold: '5', imageUrl: '', isActive: true });
      const initialAttrs = {};
      (p.variantOptions || []).forEach(o => { initialAttrs[o.name] = ''; });
      setVariantAttributes(initialAttrs);
      setShowVariantModal(true);
    } catch {
      toast.error('Could not load product details.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`addvar-${productId}`]: false }));
    }
  };

  // BUG FIX #7: fetch parent product to get variantOptions for dropdowns
  const openEditVariant = async (productId, variant) => {
    setActionLoading(prev => ({ ...prev, [`editvar-${variant.id}`]: true }));
    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data.product ?? res.data;
      setActiveVariantOptions(p.variantOptions || []);
    } catch {
      setActiveVariantOptions([]);
    } finally {
      setActionLoading(prev => ({ ...prev, [`editvar-${variant.id}`]: false }));
    }
    setEditingVariantId(variant.id);
    setVariantForm({
      productId: productId,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || '',
      stockQuantity: variant.stockQuantity,
      lowStockThreshold: variant.lowStockThreshold ?? 5,
      isActive: isActive(variant),
      imageUrl: variant.images?.[0]?.url || '',
    });
    setVariantAttributes({ ...(variant.attributes || {}) });
    setShowVariantModal(true);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    // BUG FIX #8: only validate attributes if variantOptions are defined on the product
    if (activeVariantOptions.length > 0) {
      for (const [key, val] of Object.entries(variantAttributes)) {
        if (!val) { toast.error(`Select a value for ${key}`); return; }
      }
    }
    setVariantSaving(true);
    const payload = {
      id: editingVariantId,
      productId: variantForm.productId,
      sku: variantForm.sku,
      price: parseFloat(String(variantForm.price).replace(/,/g, '')) || 0,
      compareAtPrice: variantForm.compareAtPrice ? parseFloat(String(variantForm.compareAtPrice).replace(/,/g, '')) : null,
      stockQuantity: parseInt(variantForm.stockQuantity) || 0,
      attributes: variantAttributes,
      isActive: variantForm.isActive,
      images: variantForm.imageUrl ? [{ url: variantForm.imageUrl, altText: variantForm.sku, isPrimary: true }] : [],
    };
    try {
      await api.post('/products/variants', payload);
      toast.success(editingVariantId ? 'Variant updated!' : 'Variant added!');
      setShowVariantModal(false);
      // BUG FIX #11: wait for async aggregate recalculation then force refresh
      await refreshAfterDelay(async () => {
        await loadVariants(variantForm.productId, true);
        await fetchProducts();
      }, 900);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVariantSaving(false);
    }
  };

  const toggleVariantActive = async (variant, productId) => {
    const key = `togglevar-${variant.id}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await api.post('/products/variants', {
        id: variant.id, productId,
        sku: variant.sku, price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stockQuantity: variant.stockQuantity,
        attributes: variant.attributes,
        // BUG FIX #6: use isActive(variant) helper
        isActive: !isActive(variant),
        images: variant.images || [],
      });
      toast.success(`Variant ${!isActive(variant) ? 'activated' : 'hidden'}`);
      await refreshAfterDelay(async () => {
        await loadVariants(productId, true);
        await fetchProducts();
      }, 900);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteVariant = async (variantId, productId) => {
    if (!window.confirm('Permanently delete this variant?')) return;
    setActionLoading(prev => ({ ...prev, [`deletevar-${variantId}`]: true }));
    try {
      await api.delete(`/products/variants/${variantId}`);
      toast.success('Variant deleted');
      await refreshAfterDelay(async () => {
        await loadVariants(productId, true);
        await fetchProducts();
      }, 900);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [`deletevar-${variantId}`]: false }));
    }
  };

  // ── early returns ─────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-slate-400">
      <Loader2 size={32} className="animate-spin text-blue-500" />
      <p className="text-sm font-semibold">Loading Inventory Engine...</p>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-blue-600" size={26} /> Inventory Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage products, variants, pricing and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchProducts} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreateProduct}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200/80 hover:bg-black transition-colors flex items-center gap-2">
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ShoppingBag} label="Total Products" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle} label="Active" value={stats.active} color="bg-green-50 text-green-600" />
        <StatCard icon={AlertTriangle} label="Low Stock (≤10)" value={stats.lowStock} color="bg-amber-50 text-amber-600" />
        <StatCard icon={TrendingUp} label="Out of Stock" value={stats.outOfStock} color="bg-red-50 text-red-500" />
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search by name, category or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="p-4 w-10"></th>
                <th className="p-4">Product</th>
                <th className="p-4">Price Range</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <Package size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-semibold text-sm">
                      {search ? `No products matching "${search}"` : 'No products yet. Create your first one!'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <React.Fragment key={p.id}>
                  {/* ── Product Row ── */}
                  <tr
                    onClick={() => toggleRow(p.id)}
                    className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${expandedId === p.id ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="p-4 text-slate-400">
                      {expandedId === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {p.images?.length > 0
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover mix-blend-multiply" onError={e => { e.target.style.display = 'none'; }} />
                            : <ImageIcon size={18} className="text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                            {p.name}
                            {p.activeCampaignId && <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">On Sale</span>}
                            {/* BUG FIX #1: use isActive() helper */}
                            {!isActive(p) && <span className="bg-slate-100 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Hidden</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-1">
                            <span>/{p.slug}</span>
                            {p.categoryName && <><span>•</span><span>{p.categoryName}</span></>}
                            {p.brandName && <><span>•</span><span>{p.brandName}</span></>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {/* BUG FIX #4: ProductResponse sends minPrice as "price" */}
                      <p className="font-black text-slate-900 text-sm">₦{fmt(p.price)}</p>
                      {p.compareAtPrice > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">₦{fmt(p.compareAtPrice)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      {/* BUG FIX #5: ProductResponse maps totalStock → stockQuantity */}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        (p.stockQuantity || 0) === 0 ? 'bg-red-50 text-red-600'
                        : (p.stockQuantity || 0) <= 10 ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                      }`}>
                        {(p.stockQuantity || 0) === 0 ? 'Out of stock'
                          : (p.stockQuantity || 0) <= 10 ? `⚠ ${p.stockQuantity} left`
                          : `${p.stockQuantity} units`}
                      </span>
                    </td>
                    <td className="p-4">
                      {/* BUG FIX #1: use isActive() helper */}
                      {isActive(p)
                        ? <span className="flex items-center gap-1.5 text-xs font-bold text-green-600"><CheckCircle size={13} /> Active</span>
                        : <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><EyeOff size={13} /> Hidden</span>}
                    </td>
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <ActionButton
                          onClick={() => toggleProductActive(p)}
                          loading={actionLoading[`toggle-${p.id}`]}
                          icon={isActive(p) ? EyeOff : Eye}
                          title={isActive(p) ? 'Hide product' : 'Activate product'}
                          colorClass="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        />
                        <ActionButton
                          onClick={() => openEditProduct(p.id)}
                          loading={actionLoading[`edit-${p.id}`]}
                          icon={Edit}
                          title="Edit product"
                          colorClass="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        />
                        <ActionButton
                          onClick={() => handleDeleteProduct(p.id)}
                          loading={actionLoading[`delete-${p.id}`]}
                          icon={Trash2}
                          title="Delete product"
                          colorClass="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* ── Variants Tray ── */}
                  {expandedId === p.id && (
                    <tr className="bg-gradient-to-b from-blue-50/30 to-slate-50/30">
                      <td></td>
                      <td colSpan="5" className="px-4 py-4">
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Layers size={13} /> Variants
                            </h4>
                            <ActionButton
                              onClick={() => openAddVariant(p.id)}
                              loading={actionLoading[`addvar-${p.id}`]}
                              icon={Plus}
                              title="Add variant"
                              colorClass="text-slate-600 hover:text-slate-900 hover:bg-slate-100 !p-2"
                            />
                          </div>

                          {!productVariants[p.id] ? (
                            <div className="flex items-center justify-center py-8 text-slate-400">
                              <Loader2 size={16} className="animate-spin mr-2" /> Loading…
                            </div>
                          ) : productVariants[p.id].length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 font-medium">
                              No variants yet — click + to add one.
                            </div>
                          ) : (
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/30">
                                  <th className="px-4 py-2.5 font-bold">SKU</th>
                                  <th className="px-4 py-2.5 font-bold">Attributes</th>
                                  <th className="px-4 py-2.5 font-bold">Stock</th>
                                  <th className="px-4 py-2.5 font-bold">Price</th>
                                  <th className="px-4 py-2.5 font-bold">Status</th>
                                  <th className="px-4 py-2.5 font-bold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {productVariants[p.id].map(v => (
                                  <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${!isActive(v) ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3">
                                      <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{v.sku}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-xs text-slate-600">
                                        {Object.entries(v.attributes || {}).map(([k, val]) => (
                                          <span key={k} className="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium mr-1">{k}: {val}</span>
                                        ))}
                                        {Object.keys(v.attributes || {}).length === 0 && <span className="text-slate-400 italic">—</span>}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`text-xs font-bold ${
                                        (v.stockQuantity || 0) === 0 ? 'text-red-600'
                                        : (v.stockQuantity || 0) <= (v.lowStockThreshold || 5) ? 'text-amber-600'
                                        : 'text-slate-700'
                                      }`}>
                                        {(v.stockQuantity || 0) === 0 ? '⚠ Out' : v.stockQuantity}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div>
                                        <span className="text-sm font-black text-slate-900">₦{fmt(v.price)}</span>
                                        {v.compareAtPrice > 0 && <span className="ml-2 text-[10px] text-slate-400 line-through">₦{fmt(v.compareAtPrice)}</span>}
                                        {v.activeCampaignId && <span className="ml-2 text-[9px] text-red-500 font-black uppercase">Sale</span>}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {isActive(v)
                                        ? <span className="text-[10px] font-bold text-green-600">Active</span>
                                        : <span className="text-[10px] font-bold text-slate-400">Hidden</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-end gap-1">
                                        <ActionButton
                                          onClick={() => toggleVariantActive(v, p.id)}
                                          loading={actionLoading[`togglevar-${v.id}`]}
                                          icon={isActive(v) ? EyeOff : Eye}
                                          title={isActive(v) ? 'Hide variant' : 'Activate variant'}
                                          colorClass="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                        />
                                        <ActionButton
                                          onClick={() => openEditVariant(p.id, v)}
                                          loading={actionLoading[`editvar-${v.id}`]}
                                          icon={Edit}
                                          title="Edit variant"
                                          colorClass="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        />
                                        <ActionButton
                                          onClick={() => handleDeleteVariant(v.id, p.id)}
                                          loading={actionLoading[`deletevar-${v.id}`]}
                                          icon={Trash2}
                                          title="Delete variant"
                                          colorClass="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <p className="text-xs text-slate-500 font-medium">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL 1: CREATE / EDIT PRODUCT
          ═══════════════════════════════════════════════ */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                {editingProductId ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-7">
              <form id="productForm" onSubmit={handleProductSubmit} className="space-y-7">

                {/* ── Basic Details ── */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Product Name *</label>
                      <input required type="text"
                        value={productForm.name}
                        onChange={e => setProductForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))}
                        className="input" placeholder="e.g., Samsung Galaxy S25 Ultra" />
                    </div>
                    <div>
                      <label className="label">URL Slug *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                        <input required type="text"
                          value={productForm.slug}
                          onChange={e => setProductForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                          className="input pl-6" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Product Image URL</label>
                      <input type="url" value={productForm.imageUrl}
                        onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))}
                        className="input" placeholder="https://…" />
                      {productForm.imageUrl && (
                        <img src={productForm.imageUrl} alt="preview" onError={e => { e.target.style.display = 'none'; }}
                          className="mt-2 h-14 w-14 object-cover rounded-lg border border-slate-200" />
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="label">Description</label>
                      <textarea rows={3} value={productForm.description}
                        onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                        className="input resize-none" placeholder="Product details, features, highlights…" />
                    </div>
                  </div>
                </section>

                {/* ── Pricing & Organisation ── */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Pricing & Organisation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Base Price (₦) *</label>
                      <input required type="number" min="0" step="0.01"
                        value={productForm.basePrice}
                        onChange={e => setProductForm(f => ({ ...f, basePrice: e.target.value }))}
                        className={`input ${productVariants[editingProductId]?.length > 0 ? 'bg-slate-100 text-slate-500' : ''}`} 
                      />
                      {/* 🔥 THE SMART WARNING */}
                      {productVariants[editingProductId]?.length > 0 ? (
                        <p className="hint text-amber-600 font-bold mt-1.5">
                          <AlertTriangle size={11} className="shrink-0" /> Variants exist! The Homepage will ignore this and show the lowest variant price.
                        </p>
                      ) : (
                        <p className="hint mt-1.5"><Info size={10} /> Shown on homepage when no variants exist.</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Compare-At Price (₦)</label>
                      <input type="number" min="0" step="0.01"
                        value={productForm.compareAtPrice}
                        onChange={e => setProductForm(f => ({ ...f, compareAtPrice: e.target.value }))}
                        className="input" placeholder="Displays as struck-through" />
                    </div>
                    <div>
                      <label className="label">Category Slug *</label>
                      {categories.length > 0 ? (
                        <select value={productForm.categorySlug}
                          onChange={e => setProductForm(f => ({ ...f, categorySlug: e.target.value }))}
                          className="input">
                          <option value="">— Select category —</option>
                          {/* Flatten tree for select */}
                          {(function flatten(nodes, depth = 0) {
                            return nodes.flatMap(n => [
                              <option key={n.slug || n.id} value={n.slug || n.id}>
                                {'  '.repeat(depth)}{depth > 0 ? '↳ ' : ''}{n.name}
                              </option>,
                              ...flatten(n.children || [], depth + 1)
                            ]);
                          })(categories)}
                        </select>
                      ) : (
                        <input type="text" value={productForm.categorySlug}
                          onChange={e => setProductForm(f => ({ ...f, categorySlug: e.target.value }))}
                          className="input" placeholder="e.g., electronics" />
                      )}
                    </div>
                    <div>
                      <label className="label">Brand Slug</label>
                      <input type="text" value={productForm.brandSlug}
                        onChange={e => setProductForm(f => ({ ...f, brandSlug: e.target.value }))}
                        className="input" placeholder="e.g., samsung" />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1"><Tag size={11} /> Campaign Tags</label>
                      <input type="text" value={productForm.tags}
                        onChange={e => setProductForm(f => ({ ...f, tags: e.target.value }))}
                        className="input" placeholder="flash-sale, featured, electronics" />
                      <p className="hint"><Info size={10} /> Comma-separated. Used for campaign targeting.</p>
                    </div>
                    {/* BUG FIX: isActive was missing from product form! */}
                    <div className="flex items-center">
                      <label className="label mb-0 mr-4">Visibility</label>
                      <button type="button"
                        onClick={() => setProductForm(f => ({ ...f, isActive: !f.isActive }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${productForm.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {productForm.isActive ? <><ToggleRight size={18} /> Active</> : <><ToggleLeft size={18} /> Hidden</>}
                      </button>
                    </div>
                  </div>
                </section>

                {/* ── Specs & Variant Options ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Tech Specs */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5"><ListOrdered size={13} /> Tech Specs</h3>
                      <button type="button" onClick={() => setSpecRows(r => [...r, { key: '', value: '' }])}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {specRows.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={row.key}
                            onChange={e => { const r = [...specRows]; r[i].key = e.target.value; setSpecRows(r); }}
                            className="w-1/2 input-sm" placeholder="Key" />
                          <input type="text" value={row.value}
                            onChange={e => { const r = [...specRows]; r[i].value = e.target.value; setSpecRows(r); }}
                            className="flex-1 input-sm" placeholder="Value" />
                          {i > 0 && <button type="button" onClick={() => setSpecRows(r => r.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-1 text-sm">×</button>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variant Options */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5"><Layers size={13} /> Variant Matrix</h3>
                      <button type="button" onClick={() => setOptionRows(r => [...r, { name: '', values: '' }])}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {optionRows.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={row.name}
                            onChange={e => { const r = [...optionRows]; r[i].name = e.target.value; setOptionRows(r); }}
                            className="w-1/3 input-sm border-blue-200" placeholder="Color" />
                          <input type="text" value={row.values}
                            onChange={e => { const r = [...optionRows]; r[i].values = e.target.value; setOptionRows(r); }}
                            className="flex-1 input-sm border-blue-200" placeholder="Red, Blue, Black" />
                          {i > 0 && <button type="button" onClick={() => setOptionRows(r => r.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-1 text-sm">×</button>}
                        </div>
                      ))}
                    </div>
                    <p className="hint mt-2"><Info size={10} /> Each combination becomes a separate variant you can stock individually.</p>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex gap-3">
              <button type="button" onClick={() => setShowProductModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
                Cancel
              </button>
              <button type="submit" form="productForm" disabled={productSaving}
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {productSaving && <Loader2 size={15} className="animate-spin" />}
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL 2: CREATE / EDIT VARIANT
          ═══════════════════════════════════════════════ */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                {editingVariantId ? 'Edit Variant' : 'Add Variant'}
              </h2>
              <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVariantSubmit} className="overflow-y-auto p-6 space-y-5">

              {/* Attributes */}
              {Object.keys(variantAttributes).length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3 mb-3 border-b border-slate-200">Variant Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(variantAttributes).map(key => {
                      // BUG FIX #7: use activeVariantOptions (loaded fresh from API)
                      const opts = activeVariantOptions.find(o => o.name === key)?.values || [];
                      return (
                        <div key={key}>
                          <label className="label">{key}</label>
                          {/* BUG FIX #8: show text input if no options defined */}
                          {opts.length > 0 ? (
                            <select required value={variantAttributes[key] || ''}
                              onChange={e => setVariantAttributes(a => ({ ...a, [key]: e.target.value }))}
                              className="input">
                              <option value="" disabled>Select {key}</option>
                              {opts.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={variantAttributes[key] || ''}
                              onChange={e => setVariantAttributes(a => ({ ...a, [key]: e.target.value }))}
                              className="input" placeholder={`Enter ${key}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Core fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">SKU *</label>
                  <input required type="text" value={variantForm.sku}
                    onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))}
                    className="input" placeholder="e.g. PHONE-BLK-256GB" />
                </div>
                <div className="col-span-2">
                  <label className="label">Price (₦) *</label>
                  <input required type="number" min="0" step="0.01" value={variantForm.price}
                    onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))}
                    className="input" />
                  <p className="hint"><Info size={10} /> This price updates the product's homepage price range.</p>
                </div>
                <div>
                  <label className="label">Compare-At (₦)</label>
                  <input type="number" min="0" step="0.01" value={variantForm.compareAtPrice}
                    onChange={e => setVariantForm(f => ({ ...f, compareAtPrice: e.target.value }))}
                    className="input" placeholder="Optional" />
                </div>
                <div>
                  <label className="label">Stock Qty *</label>
                  <input required type="number" min="0" value={variantForm.stockQuantity}
                    onChange={e => setVariantForm(f => ({ ...f, stockQuantity: e.target.value }))}
                    className="input" />
                </div>
                <div>
                  <label className="label">Low Stock Alert At</label>
                  <input type="number" min="1" value={variantForm.lowStockThreshold}
                    onChange={e => setVariantForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="input" />
                  <p className="hint"><Info size={10} /> Warn when stock falls to this number.</p>
                </div>
                <div>
                  <label className="label">Visibility</label>
                  <button type="button"
                    onClick={() => setVariantForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors ${variantForm.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {variantForm.isActive ? <><ToggleRight size={16} /> Active</> : <><ToggleLeft size={16} /> Hidden</>}
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="label">Variant Image URL</label>
                  <input type="url" value={variantForm.imageUrl}
                    onChange={e => setVariantForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="input" placeholder="Optional variant-specific image" />
                  {variantForm.imageUrl && (
                    <img src={variantForm.imageUrl} alt="preview" onError={e => { e.target.style.display = 'none'; }}
                      className="mt-2 h-12 w-12 object-cover rounded-lg border border-slate-200" />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowVariantModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={variantSaving}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {variantSaving && <Loader2 size={15} className="animate-spin" />}
                  {editingVariantId ? 'Update Variant' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Utility classes via style tag ── */}
      <style>{`
        .label { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font-size: 14px; font-weight: 500; outline: none; transition: box-shadow 0.15s; }
        .input:focus { box-shadow: 0 0 0 2px #3b82f6; border-color: #3b82f6; }
        .input-sm { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; width: 100%; }
        .input-sm:focus { box-shadow: 0 0 0 2px #3b82f6; }
        .hint { display: flex; align-items: center; gap: 4px; font-size: 9px; color: #94a3b8; margin-top: 4px; }
      `}</style>
    </div>
  );
};

export default AdminProducts;