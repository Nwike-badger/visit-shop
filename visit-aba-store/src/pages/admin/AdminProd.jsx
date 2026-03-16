// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import api from '../../api/axiosConfig';
// import { toast } from 'react-hot-toast';
// import {
//   Package, Plus, Edit, Trash2, Tag, Info,
//   Search, RefreshCw, X, Loader2, ArrowLeft,
//   Video, Zap, Image as ImageIcon, Eye, EyeOff,
//   CheckCircle, AlertTriangle,
// } from 'lucide-react';

// // ─── utils ────────────────────────────────────────────────────────────────────
// const fmt = (n) => Number(n || 0).toLocaleString('en-NG');
// const isActive = (obj) => obj?.active !== false;
// const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// const getErr = (err) => {
//   if (err.response?.data?.errors?.length > 0)
//     return err.response.data.errors[0].defaultMessage;
//   return err.response?.data?.message || err.message || 'Something went wrong';
// };

// // ─── shared UI primitives ─────────────────────────────────────────────────────
// const inp = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300";

// const Field = ({ label, hint, children }) => (
//   <div>
//     {label && (
//       <div className="mb-1.5">
//         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
//         {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
//       </div>
//     )}
//     {children}
//   </div>
// );

// const Card = ({ children, className = '' }) => (
//   <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
//     {children}
//   </div>
// );
// const CardHeader = ({ children, action }) => (
//   <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
//     <h3 className="text-sm font-black text-slate-800">{children}</h3>
//     {action}
//   </div>
// );
// const CardBody = ({ children, className = '' }) => (
//   <div className={`p-5 ${className}`}>{children}</div>
// );

// // flatten category tree for <select>
// const flattenTree = (nodes, depth = 0, result = []) => {
//   for (const n of nodes) {
//     result.push({
//       label: `${'  '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${n.name}`,
//       value: n.slug || n.id,
//     });
//     if (n.children?.length) flattenTree(n.children, depth + 1, result);
//   }
//   return result;
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // ROOT COMPONENT — list + editor routing
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function AdminProducts() {
//   const [view, setView] = useState('list');
//   const [editingId, setEditingId] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [deleting, setDeleting] = useState({});

//   const fetchAll = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [pRes, cRes, bRes] = await Promise.all([
//         api.get('/products?page=0&size=100'),
//         api.get('/categories/tree').catch(() => ({ data: [] })),
//         api.get('/brands').catch(() => ({ data: [] })),
//       ]);
//       setProducts(pRes.data.content ?? pRes.data ?? []);
//       setCategories(cRes.data || []);
//       // brands can be a page or a plain array
//       const bData = bRes.data;
//       setBrands(Array.isArray(bData) ? bData : (bData?.content ?? []));
//     } catch {
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchAll(); }, [fetchAll]);

//   const openEditor = (id = null) => { setEditingId(id); setView('form'); };
//   const closeEditor = () => { setEditingId(null); setView('list'); fetchAll(); };

//   const handleDelete = async (productId, e) => {
//     e.stopPropagation();
//     if (!window.confirm('Permanently delete this product and all its variants?')) return;
//     setDeleting(d => ({ ...d, [productId]: true }));
//     try {
//       await api.delete(`/products/${productId}`);
//       toast.success('Product deleted');
//       fetchAll();
//     } catch (err) {
//       toast.error(getErr(err));
//       setDeleting(d => ({ ...d, [productId]: false }));
//     }
//   };

//   // ── LIST VIEW ───────────────────────────────────────────────────────────────
//   if (view === 'list') {
//     const filtered = products.filter(p =>
//       !search ||
//       p.name?.toLowerCase().includes(search.toLowerCase()) ||
//       p.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
//       p.brandName?.toLowerCase().includes(search.toLowerCase()) ||
//       p.slug?.toLowerCase().includes(search.toLowerCase())
//     );

//     const stats = [
//       { label: 'Total', val: products.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
//       { label: 'Active', val: products.filter(isActive).length, color: 'bg-green-50 text-green-700 border-green-100' },
//       { label: 'Low Stock', val: products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length, color: 'bg-amber-50 text-amber-700 border-amber-100' },
//       { label: 'Out of Stock', val: products.filter(p => (p.stockQuantity || 0) === 0).length, color: 'bg-red-50 text-red-600 border-red-100' },
//     ];

//     return (
//       <div className="min-h-screen bg-slate-50 p-6 font-sans">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
//               <Package className="text-blue-600" size={24} /> Products
//             </h1>
//             <p className="text-slate-500 text-sm mt-0.5">{products.length} items in catalog</p>
//           </div>
//           <div className="flex gap-2.5">
//             <button onClick={fetchAll}
//               className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
//               <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
//             </button>
//             <button onClick={() => openEditor()}
//               className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10">
//               <Plus size={15} /> Add product
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
//           {stats.map(s => (
//             <div key={s.label} className={`rounded-xl px-4 py-3 border ${s.color}`}>
//               <p className="text-2xl font-black leading-none">{s.val}</p>
//               <p className="text-[11px] font-semibold mt-0.5 opacity-80">{s.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="relative mb-4">
//           <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//           <input type="text" placeholder="Search by name, slug, category or brand…"
//             value={search} onChange={e => setSearch(e.target.value)}
//             className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium outline-none focus:border-blue-400 shadow-sm transition-colors" />
//           {search && (
//             <button onClick={() => setSearch('')}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
//               <X size={14} />
//             </button>
//           )}
//         </div>

//         {/* Table */}
//         <Card>
//           {loading ? (
//             <div className="flex items-center justify-center py-20 text-slate-400">
//               <Loader2 size={24} className="animate-spin text-blue-400" />
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left min-w-[680px]">
//                 <thead>
//                   <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
//                     <th className="px-5 py-3.5">Product</th>
//                     <th className="px-5 py-3.5">Category / Brand</th>
//                     <th className="px-5 py-3.5">Price</th>
//                     <th className="px-5 py-3.5">Stock</th>
//                     <th className="px-5 py-3.5">Status</th>
//                     <th className="px-5 py-3.5 w-16"></th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {filtered.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="py-16 text-center">
//                         <Package size={28} className="mx-auto text-slate-200 mb-2" />
//                         <p className="text-slate-400 font-medium text-sm">
//                           {search ? `No results for "${search}"` : 'No products yet — add your first!'}
//                         </p>
//                       </td>
//                     </tr>
//                   ) : filtered.map(p => (
//                     <tr key={p.id} onClick={() => openEditor(p.id)}
//                       className="hover:bg-slate-50/80 cursor-pointer transition-colors">
//                       <td className="px-5 py-3.5">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
//                             {p.images?.[0] ? (
//                               <img src={p.images[0].url} alt=""
//                                 className="w-full h-full object-cover"
//                                 onError={e => { e.target.style.display = 'none'; }} />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center">
//                                 <ImageIcon size={14} className="text-slate-300" />
//                               </div>
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{p.name}</p>
//                             <p className="text-[10px] text-slate-400 font-mono">/{p.slug}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <p className="text-xs font-semibold text-slate-700">{p.categoryName || '—'}</p>
//                         {p.brandName && <p className="text-[11px] text-slate-400">{p.brandName}</p>}
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <p className="font-black text-slate-900 text-sm">₦{fmt(p.price)}</p>
//                         {p.compareAtPrice > 0 && (
//                           <p className="text-[10px] text-slate-400 line-through">₦{fmt(p.compareAtPrice)}</p>
//                         )}
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
//                           (p.stockQuantity || 0) === 0
//                             ? 'bg-red-50 text-red-600'
//                             : (p.stockQuantity || 0) <= 10
//                             ? 'bg-amber-50 text-amber-700'
//                             : 'bg-slate-100 text-slate-600'
//                         }`}>
//                           {(p.stockQuantity || 0) === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
//                         </span>
//                       </td>
//                       <td className="px-5 py-3.5">
//                         {isActive(p)
//                           ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12} />Active</span>
//                           : <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><EyeOff size={12} />Draft</span>}
//                       </td>
//                       <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
//                         <button onClick={(e) => handleDelete(p.id, e)}
//                           disabled={deleting[p.id]}
//                           className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                           {deleting[p.id] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <ProductEditor
//       productId={editingId}
//       onBack={closeEditor}
//       categories={categories}
//       brands={brands}
//     />
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // PRODUCT EDITOR — Shopify-grade
// // ═══════════════════════════════════════════════════════════════════════════════
// function ProductEditor({ productId, onBack, categories, brands }) {
//   const isEdit = !!productId;
//   const [loading, setLoading] = useState(isEdit);
//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // form
//   const [form, setForm] = useState({
//     name: '', slug: '', description: '',
//     basePrice: '', compareAtPrice: '', discount: '',
//     categorySlug: '', brandSlug: '',
//     tags: '', isActive: true,
//   });
//   const setF = (patch) => setForm(f => ({ ...f, ...patch }));

//   // media: [{url, isPrimary, type: 'IMAGE'|'VIDEO'}]
//   const [media, setMedia] = useState([]);
//   const [mediaInput, setMediaInput] = useState('');

//   // options: [{name: '', values: []}]
//   const [options, setOptions] = useState([]);

//   // variants: [{id?, sku, price, compareAtPrice, stockQuantity, attributes, isActive, imageUrl}]
//   const [variants, setVariants] = useState([]);

//   // specs: [{key, value}]
//   const [specs, setSpecs] = useState([{ key: '', value: '' }]);

//   // bulk
//   const [bulkPrice, setBulkPrice] = useState('');
//   const [bulkStock, setBulkStock] = useState('');

//   // ── Direct inventory (for products WITHOUT variant options) ─────────────────
//   // These map to a hidden "default" variant (attributes={}) that the backend
//   // requires to hold stock. Without it, updateParentAggregates() forces totalStock=0.
//   const [directInventory, setDirectInventory] = useState({
//     variantId: null,   // populated on edit so we UPDATE rather than create a duplicate
//     sku: '',
//     stock: '0',
//   });

//   const slugEdited = useRef(false);
//   const flatCats = flattenTree(categories);

//   // ── load existing product ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (!isEdit) return;
//     (async () => {
//       try {
//         const res = await api.get(`/products/${productId}`);
//         // /products/{id} returns { product: {...}, variants: [...] }
//         const p = res.data.product ?? res.data;
//         const v = res.data.variants ?? [];

//         slugEdited.current = true;

//         setF({
//           name: p.name || '',
//           slug: p.slug || '',
//           description: p.description || '',
//           basePrice: p.basePrice ?? '',
//           compareAtPrice: p.compareAtPrice ?? '',
//           discount: p.discount > 0 ? String(p.discount) : '',
//           categorySlug: p.categorySlug || '',
//           // brand comes as {slug, name} in the nested object
//           brandSlug: p.brand?.slug || brands.find(b => b.name === p.brandName)?.slug || '',
//           tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
//           isActive: p.active !== false,
//         });

//         // ProductImage has: url, isPrimary/primary, type (enum string: IMAGE/VIDEO)
//         setMedia((p.images || []).map(img => ({
//           url: img.url,
//           isPrimary: !!(img.isPrimary ?? img.primary),
//           type: img.type ?? img.mediaType ?? 'IMAGE',
//         })));

//         const loadedOptions = (p.variantOptions || []).map(o => ({ name: o.name, values: o.values }));
//         setOptions(loadedOptions);

//         const hasOptions = loadedOptions.length > 0;

//         if (hasOptions) {
//           // Product with real variants — load into matrix
//           setVariants(v.map(vt => ({
//             id: vt.id,
//             sku: vt.sku || '',
//             price: vt.price ?? '',
//             compareAtPrice: vt.compareAtPrice ?? '',
//             stockQuantity: vt.stockQuantity ?? 0,
//             attributes: vt.attributes || {},
//             isActive: vt.active !== false,
//             imageUrl: (vt.images || []).find(i => i.isPrimary ?? i.primary)?.url || '',
//           })));
//         } else {
//           // No-option product — find the hidden default variant (attributes={})
//           // We MUST store its id so re-saving UPDATEs it instead of creating a duplicate
//           const defaultVariant = v.find(vt => Object.keys(vt.attributes || {}).length === 0) || v[0];
//           if (defaultVariant) {
//             setDirectInventory({
//               variantId: defaultVariant.id,
//               sku: defaultVariant.sku || '',
//               stock: String(defaultVariant.stockQuantity ?? 0),
//             });
//           }
//           setVariants([]); // no matrix needed
//         }

//         if (p.specifications && Object.keys(p.specifications).length) {
//           setSpecs(Object.entries(p.specifications).map(([k, val]) => ({ key: k, value: val })));
//         }
//       } catch {
//         toast.error('Failed to load product');
//         onBack();
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [productId]); // eslint-disable-line

//   // ── auto-slug ───────────────────────────────────────────────────────────────
//   const handleNameChange = (val) => {
//     if (!slugEdited.current) {
//       setF({ name: val, slug: slugify(val) });
//     } else {
//       setF({ name: val });
//     }
//   };

//   // ── cartesian product for variant matrix ────────────────────────────────────
//   const generateMatrix = useCallback((currentOptions, prevVariants, baseName, basePrice) => {
//     const valid = currentOptions.filter(o => o.name.trim() && o.values.length > 0);
//     if (valid.length === 0) { setVariants([]); return; }

//     const keys = valid.map(o => o.name.trim());
//     const valArrays = valid.map(o => o.values);

//     const cartesian = (arrs) =>
//       arrs.reduce((acc, arr) => acc.flatMap(c => arr.map(v => [...c, v])), [[]]);

//     const combos = cartesian(valArrays).map(vals => {
//       const attrs = {};
//       keys.forEach((k, i) => { attrs[k] = vals[i]; });
//       return attrs;
//     });

//     setVariants(prev => combos.map(attrs => {
//       const existing = prev.find(
//         pv => JSON.stringify(pv.attributes) === JSON.stringify(attrs)
//       );
//       if (existing) return existing;
//       // auto SKU: PRODUCT-VAL1-VAL2
//       const namePart = (baseName || 'SKU').split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
//       const attrPart = Object.values(attrs).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
//       return {
//         sku: `${namePart}-${attrPart}`,
//         price: basePrice || '',
//         compareAtPrice: '',
//         stockQuantity: 0,
//         attributes: attrs,
//         isActive: true,
//         imageUrl: '',
//       };
//     }));
//   }, []);

//   // ── option handlers ─────────────────────────────────────────────────────────
//   const handleOptName = (i, val) => {
//     const next = options.map((o, idx) => idx === i ? { ...o, name: val } : o);
//     setOptions(next);
//     generateMatrix(next, variants, form.name, form.basePrice);
//   };

//   const handleOptValues = (i, commaStr) => {
//     const vals = commaStr.split(',').map(v => v.trim()).filter(Boolean);
//     const next = options.map((o, idx) => idx === i ? { ...o, values: vals } : o);
//     setOptions(next);
//     generateMatrix(next, variants, form.name, form.basePrice);
//   };

//   const removeOption = (i) => {
//     const next = options.filter((_, idx) => idx !== i);
//     setOptions(next);
//     generateMatrix(next, variants, form.name, form.basePrice);
//   };

//   // ── media handlers ──────────────────────────────────────────────────────────
//   const addMedia = (e) => {
//     e?.preventDefault();
//     const url = mediaInput.trim();
//     if (!url) return;
//     const isVideo =
//       url.includes('youtube.com') || url.includes('youtu.be') ||
//       url.includes('vimeo.com') || /\.(mp4|webm|mov)$/i.test(url);
//     setMedia(prev => [
//       ...prev,
//       { url, isPrimary: prev.length === 0, type: isVideo ? 'VIDEO' : 'IMAGE' },
//     ]);
//     setMediaInput('');
//   };

//   const removeMedia = (i) => {
//     setMedia(prev => {
//       const next = prev.filter((_, idx) => idx !== i);
//       if (next.length > 0 && !next.some(m => m.isPrimary)) next[0] = { ...next[0], isPrimary: true };
//       return next;
//     });
//   };

//   const setPrimary = (i) =>
//     setMedia(prev => prev.map((m, idx) => ({ ...m, isPrimary: idx === i })));

//   // ── variant helpers ─────────────────────────────────────────────────────────
//   const updateVariant = (i, patch) =>
//     setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v));

//   const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));

//   const applyBulk = () => {
//     if (!bulkPrice && !bulkStock) return;
//     setVariants(prev => prev.map(v => ({
//       ...v,
//       ...(bulkPrice !== '' ? { price: bulkPrice } : {}),
//       ...(bulkStock !== '' ? { stockQuantity: bulkStock } : {}),
//     })));
//     setBulkPrice(''); setBulkStock('');
//     toast.success('Bulk values applied to all variants');
//   };

//   // ── spec helpers ────────────────────────────────────────────────────────────
//   const updateSpec = (i, field, val) =>
//     setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

//   // ── SAVE ────────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!form.name.trim()) { toast.error('Product name is required'); return; }
//     if (!form.basePrice) { toast.error('Base price is required'); return; }
//     if (options.length > 0 && variants.some(v => !v.sku.trim())) {
//       toast.error('All variants need a SKU'); return;
//     }

//     setSaving(true);
//     try {
//       // Build variantOptions map: { "Color": ["Red","Blue"], "Size": ["S","M"] }
//       const variantOptions = {};
//       options.forEach(o => {
//         if (o.name.trim() && o.values.length > 0) variantOptions[o.name.trim()] = o.values;
//       });

//       // Build specifications map
//       const specifications = {};
//       specs.forEach(s => { if (s.key.trim()) specifications[s.key.trim()] = s.value.trim(); });

//       // Build images — CRITICAL: include `type` field to match ProductImage.MediaType enum
//       const images = media.map(m => ({
//         url: m.url,
//         isPrimary: !!m.isPrimary,
//         type: m.type || 'IMAGE',       // matches Java enum: IMAGE | VIDEO
//         altText: form.name,
//       }));

//       const productPayload = {
//         id: productId || null,
//         name: form.name.trim(),
//         slug: form.slug.trim() || slugify(form.name),
//         description: form.description.trim(),
//         basePrice: parseFloat(form.basePrice) || 0,
//         // Discount OR compareAtPrice — not both (backend's discount logic overrides compareAtPrice)
//         compareAtPrice: (!form.discount && form.compareAtPrice)
//           ? parseFloat(form.compareAtPrice) || null
//           : null,
//         discount: form.discount ? parseFloat(form.discount) : null,
//         categorySlug: form.categorySlug || null,
//         brandSlug: form.brandSlug || null,
//         isActive: form.isActive,
//         tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
//         images,
//         specifications: Object.keys(specifications).length ? specifications : {},
//         // variantOptions is Map<String, List<String>> on the backend
//         variantOptions: Object.keys(variantOptions).length ? variantOptions : {},
//       };

//       // Step 1: Save the product, get the real ID back
//       const res = await api.post('/products', productPayload);
//       const savedProductId = res.data.id;
//       if (!savedProductId) throw new Error('Product saved but no ID returned from server');

//       // Step 2: Save variants or default inventory
//       if (options.length > 0 && variants.length > 0) {
//         // ── Products WITH options: save variant matrix sequentially ──────────
//         const errors = [];
//         for (const v of variants) {
//           const variantImages = v.imageUrl
//             ? [{ url: v.imageUrl, isPrimary: true, type: 'IMAGE', altText: v.sku }]
//             : images;

//           const variantPayload = {
//             id: v.id || null,
//             productId: savedProductId,
//             sku: v.sku.trim(),
//             price: parseFloat(v.price) || 0,
//             compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) || null : null,
//             stockQuantity: parseInt(v.stockQuantity) || 0,
//             attributes: v.attributes,
//             isActive: v.isActive,
//             images: variantImages,
//           };

//           try {
//             await api.post('/products/variants', variantPayload);
//           } catch (err) {
//             const label = Object.values(v.attributes).join('/') || v.sku;
//             errors.push(`[${label}]: ${getErr(err)}`);
//           }
//         }

//         if (errors.length > 0) {
//           toast.error(`Product saved but ${errors.length} variant(s) had errors`, { duration: 6000 });
//           errors.forEach(e => toast.error(e, { duration: 6000 }));
//         } else {
//           toast.success(`Product saved with ${variants.length} variants!`);
//         }

//       } else {
//         // ── Products WITHOUT options: save/update the hidden default variant ─
//         // This is required — without a variant, updateParentAggregates() forces
//         // totalStock = 0 and the product can never appear as "in stock".
//         const autoSku = directInventory.sku.trim()
//           || `${slugify(form.name)}-default`.toUpperCase().replace(/-+/g, '-');

//         const defaultVariantPayload = {
//           id: directInventory.variantId || null, // CRITICAL: update if exists, create if null
//           productId: savedProductId,
//           sku: autoSku,
//           price: parseFloat(form.basePrice) || 0,
//           compareAtPrice: (!form.discount && form.compareAtPrice)
//             ? parseFloat(form.compareAtPrice) || null
//             : null,
//           stockQuantity: parseInt(directInventory.stock) || 0,
//           attributes: {},   // empty = default/hidden variant
//           isActive: form.isActive,
//           images,
//         };

//         await api.post('/products/variants', defaultVariantPayload);
//         toast.success(isEdit ? 'Product updated!' : 'Product created!');
//       }

//       onBack();
//     } catch (err) {
//       toast.error(getErr(err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── DELETE from editor ──────────────────────────────────────────────────────
//   const handleDelete = async () => {
//     if (!window.confirm('Permanently delete this product and ALL its variants? This cannot be undone.')) return;
//     setDeleting(true);
//     try {
//       await api.delete(`/products/${productId}`);
//       toast.success('Product deleted');
//       onBack();
//     } catch (err) {
//       toast.error(getErr(err));
//       setDeleting(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex items-center justify-center h-64">
//       <Loader2 size={28} className="animate-spin text-blue-400" />
//     </div>
//   );

//   const imageOptions = media.filter(m => m.type === 'IMAGE');
//   const hasVariants = variants.length > 0;
//   const totalUnits = variants.reduce((s, v) => s + (parseInt(v.stockQuantity) || 0), 0);

//   return (
//     <div className="min-h-screen bg-slate-50 pb-24 font-sans">

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-sm">
//         <div className="flex items-center gap-3 min-w-0">
//           <button onClick={onBack}
//             className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors shrink-0">
//             <ArrowLeft size={18} />
//           </button>
//           <div className="min-w-0">
//             <h1 className="text-base font-black text-slate-900 leading-none truncate">
//               {isEdit ? (form.name || 'Edit Product') : 'Add product'}
//             </h1>
//             {form.slug && <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{form.slug}</p>}
//           </div>
//         </div>

//         <div className="flex items-center gap-2 shrink-0">
//           {/* Status toggle */}
//           <button onClick={() => setF({ isActive: !form.isActive })}
//             className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
//               form.isActive
//                 ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
//                 : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
//             }`}>
//             {form.isActive ? <><CheckCircle size={12} /> Active</> : <><EyeOff size={12} /> Draft</>}
//           </button>
//           {isEdit && (
//             <button onClick={handleDelete} disabled={deleting}
//               className="px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50">
//               {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
//             </button>
//           )}
//           <button onClick={handleSave} disabled={saving}
//             className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-60">
//             {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (isEdit ? 'Update' : 'Save product')}
//           </button>
//         </div>
//       </div>

//       {/* ── TWO-COLUMN GRID ── */}
//       <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

//         {/* ════ LEFT COLUMN (2/3) ════ */}
//         <div className="lg:col-span-2 space-y-5">

//           {/* Basic Info */}
//           <Card>
//             <CardBody className="space-y-4">
//               <Field label="Title *">
//                 <input value={form.name} onChange={e => handleNameChange(e.target.value)}
//                   className={inp} placeholder="Short, descriptive name (e.g., Apple iPhone 15 Pro)" />
//               </Field>
//               <Field label="Description">
//                 <textarea value={form.description} onChange={e => setF({ description: e.target.value })}
//                   className={`${inp} h-28 resize-none`}
//                   placeholder="Features, materials, use cases, dimensions…" />
//               </Field>
//               <Field label="URL Slug">
//                 <div className="relative">
//                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">/</span>
//                   <input value={form.slug}
//                     onChange={e => { slugEdited.current = true; setF({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }); }}
//                     className={`${inp} pl-6`}
//                     placeholder="auto-generated-from-title" />
//                 </div>
//               </Field>
//             </CardBody>
//           </Card>

//           {/* Media Gallery */}
//           <Card>
//             <CardHeader>Media</CardHeader>
//             <CardBody className="space-y-4">
//               {media.length > 0 && (
//                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
//                   {media.map((m, i) => (
//                     <div key={i}
//                       onClick={() => m.type === 'IMAGE' && setPrimary(i)}
//                       className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
//                         m.isPrimary ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-slate-200 hover:border-slate-300'
//                       }`}>
//                       {m.type === 'VIDEO' ? (
//                         <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-1">
//                           <Video size={18} className="text-white" />
//                           <span className="text-[9px] text-slate-300 font-bold uppercase">Video</span>
//                         </div>
//                       ) : (
//                         <img src={m.url} alt="" className="w-full h-full object-cover"
//                           onError={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.display = 'none'; }} />
//                       )}
//                       {m.isPrimary && (
//                         <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
//                           Cover
//                         </div>
//                       )}
//                       <button
//                         onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
//                         className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
//                         <X size={11} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <form onSubmit={addMedia} className="flex gap-2">
//                 <input value={mediaInput} onChange={e => setMediaInput(e.target.value)}
//                   placeholder="Paste image URL or YouTube/Vimeo link…"
//                   className={`${inp} flex-1`} />
//                 <button type="submit"
//                   className="px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors shrink-0">
//                   Add
//                 </button>
//               </form>
//               <p className="text-[10px] text-slate-400 flex items-center gap-1">
//                 <Info size={10} /> Click an image to set it as the cover photo. YouTube/Vimeo links become video entries.
//               </p>
//             </CardBody>
//           </Card>

//           {/* Variants */}
//           <Card>
//             <CardHeader
//               action={
//                 <button onClick={() => setOptions(prev => [...prev, { name: '', values: [] }])}
//                   className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
//                   <Plus size={13} /> Add option
//                 </button>
//               }
//             >
//               Variants &amp; Options
//             </CardHeader>
//             <CardBody className="space-y-5">

//               {/* ── Step 1: Define options ───────────────────────────────── */}
//               {options.length === 0 ? (
//                 <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
//                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
//                     <Zap size={20} className="text-slate-400" />
//                   </div>
//                   <p className="text-sm font-bold text-slate-600">This product has no variants</p>
//                   <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
//                     Add an option to create variants. For example:<br />
//                     <span className="font-semibold">Size</span> → S, M, L, XL &nbsp;·&nbsp;
//                     <span className="font-semibold">Color</span> → Red, Blue, Black
//                   </p>
//                   <button
//                     onClick={() => setOptions([{ name: '', values: [] }])}
//                     className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 mx-auto">
//                     <Plus size={13} /> Add first option
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
//                     Step 1 — Define your option types and their values
//                   </p>
//                   {options.map((opt, i) => (
//                     <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
//                       {/* Option name + delete */}
//                       <div className="flex items-center gap-3">
//                         <div className="flex-1">
//                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
//                             Option {i + 1} Name
//                           </label>
//                           <input
//                             value={opt.name}
//                             onChange={e => handleOptName(i, e.target.value)}
//                             className={inp}
//                             placeholder="e.g.  Size,  Color,  Storage,  Material"
//                           />
//                         </div>
//                         <button
//                           onClick={() => removeOption(i)}
//                           className="mt-5 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
//                           title="Remove this option">
//                           <Trash2 size={15} />
//                         </button>
//                       </div>

//                       {/* Values input */}
//                       <div>
//                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
//                           Values <span className="font-normal text-slate-400 normal-case">(comma-separated)</span>
//                         </label>
//                         <input
//                           value={opt.values.join(', ')}
//                           onChange={e => handleOptValues(i, e.target.value)}
//                           className={inp}
//                           placeholder={
//                             opt.name?.toLowerCase().includes('size') ? 'XS, S, M, L, XL, XXL, XXXL' :
//                             opt.name?.toLowerCase().includes('color') ? 'Black, White, Red, Navy Blue' :
//                             opt.name?.toLowerCase().includes('storage') ? '64GB, 128GB, 256GB, 512GB, 1TB' :
//                             'Value 1, Value 2, Value 3…'
//                           }
//                         />
//                       </div>

//                       {/* Value chips preview */}
//                       {opt.values.length > 0 && (
//                         <div className="flex flex-wrap gap-1.5 pt-1">
//                           {opt.values.map((val, vi) => (
//                             <span key={vi} className="inline-flex items-center bg-white border border-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
//                               {val}
//                             </span>
//                           ))}
//                           <span className="text-[10px] text-slate-400 self-center ml-1">
//                             {opt.values.length} value{opt.values.length !== 1 ? 's' : ''}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   <button
//                     onClick={() => setOptions(prev => [...prev, { name: '', values: [] }])}
//                     className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-colors flex items-center justify-center gap-1.5">
//                     <Plus size={13} /> Add another option
//                   </button>
//                 </div>
//               )}

//               {/* ── Step 2: Generated Matrix ─────────────────────────────── */}
//               {hasVariants && (
//                 <div className="space-y-0">
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="flex-1 h-px bg-slate-200" />
//                     <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
//                       Step 2 — Set price, stock &amp; SKU per variant ({variants.length} total)
//                     </p>
//                     <div className="flex-1 h-px bg-slate-200" />
//                   </div>

//                   {/* Bulk Edit Bar */}
//                   <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-5 py-3.5 flex flex-wrap items-center gap-3">
//                     <span className="text-xs font-black text-white flex items-center gap-1.5">
//                       <Zap size={14} /> Bulk apply to all:
//                     </span>
//                     <div className="relative">
//                       <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300 text-xs font-bold">₦</span>
//                       <input
//                         type="number"
//                         placeholder="Price"
//                         value={bulkPrice}
//                         onChange={e => setBulkPrice(e.target.value)}
//                         className="w-28 bg-white/15 border border-white/30 text-white placeholder-blue-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs outline-none focus:bg-white/25 focus:border-white/60"
//                       />
//                     </div>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         placeholder="Qty"
//                         value={bulkStock}
//                         onChange={e => setBulkStock(e.target.value)}
//                         className="w-24 bg-white/15 border border-white/30 text-white placeholder-blue-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white/25 focus:border-white/60"
//                       />
//                     </div>
//                     <button
//                       onClick={applyBulk}
//                       className="bg-white text-blue-700 text-xs font-black px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
//                       Apply
//                     </button>
//                     <span className="ml-auto text-xs text-blue-200 font-medium">
//                       {totalUnits} total units
//                     </span>
//                   </div>

//                   {/* Matrix Table — full width, spacious rows */}
//                   <div className="border-x border-b border-slate-200 rounded-b-2xl overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-left" style={{ minWidth: '720px' }}>
//                         <thead>
//                           <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
//                             <th className="px-5 py-3 min-w-[180px]">
//                               Variant
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">Combination &amp; visibility</span>
//                             </th>
//                             <th className="px-4 py-3 w-24">
//                               Image
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">Optional</span>
//                             </th>
//                             <th className="px-4 py-3 w-32">
//                               Price ₦ *
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">Selling price</span>
//                             </th>
//                             <th className="px-4 py-3 w-32">
//                               Was ₦
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">Strikethrough</span>
//                             </th>
//                             <th className="px-4 py-3 w-24">
//                               Qty *
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">In stock</span>
//                             </th>
//                             <th className="px-4 py-3 w-36">
//                               SKU *
//                               <span className="block text-[9px] normal-case font-normal text-slate-400 mt-0.5">Product code</span>
//                             </th>
//                             <th className="px-4 py-3 w-10"></th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                           {variants.map((v, i) => {
//                             const attrEntries = Object.entries(v.attributes);
//                             const stockNum = parseInt(v.stockQuantity) || 0;
//                             return (
//                               <tr key={i} className={`transition-colors ${v.isActive ? 'hover:bg-slate-50/60' : 'bg-slate-50/40'}`}>

//                                 {/* Variant Identity */}
//                                 <td className="px-5 py-4">
//                                   {/* Attribute chips */}
//                                   <div className="flex flex-wrap gap-1.5 mb-2">
//                                     {attrEntries.map(([key, val]) => (
//                                       <span key={key} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
//                                         v.isActive
//                                           ? 'bg-white border-slate-300 text-slate-800'
//                                           : 'bg-slate-100 border-slate-200 text-slate-400'
//                                       }`}>
//                                         <span className="text-slate-400 font-normal">{key}:</span> {val}
//                                       </span>
//                                     ))}
//                                   </div>
//                                   {/* Status + stock badges */}
//                                   <div className="flex items-center gap-2 flex-wrap">
//                                     {/* Visibility toggle — clear labeled button */}
//                                     <button
//                                       onClick={() => updateVariant(i, { isActive: !v.isActive })}
//                                       className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
//                                         v.isActive
//                                           ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
//                                           : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
//                                       }`}
//                                     >
//                                       {v.isActive
//                                         ? <><CheckCircle size={10} /> Visible</>
//                                         : <><EyeOff size={10} /> Hidden</>}
//                                     </button>
//                                     {stockNum === 0 && v.isActive && (
//                                       <span className="text-[10px] bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg font-bold">
//                                         Out of stock
//                                       </span>
//                                     )}
//                                     {stockNum > 0 && stockNum <= 5 && (
//                                       <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg font-bold">
//                                         Low: {stockNum} left
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>

//                                 {/* Image picker */}
//                                 <td className="px-4 py-4">
//                                   <select
//                                     value={v.imageUrl || ''}
//                                     onChange={e => updateVariant(i, { imageUrl: e.target.value })}
//                                     className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[11px] outline-none text-slate-600 focus:border-blue-400 transition-colors">
//                                     <option value="">All photos</option>
//                                     {imageOptions.map((m, idx) => (
//                                       <option key={idx} value={m.url}>Photo {idx + 1}</option>
//                                     ))}
//                                   </select>
//                                 </td>

//                                 {/* Price */}
//                                 <td className="px-4 py-4">
//                                   <div className="relative">
//                                     <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold select-none">₦</span>
//                                     <input
//                                       type="number"
//                                       min={0}
//                                       value={v.price}
//                                       onChange={e => updateVariant(i, { price: e.target.value })}
//                                       className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-sm font-semibold outline-none focus:border-blue-400 transition-colors"
//                                     />
//                                   </div>
//                                 </td>

//                                 {/* Compare-at */}
//                                 <td className="px-4 py-4">
//                                   <div className="relative">
//                                     <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold select-none">₦</span>
//                                     <input
//                                       type="number"
//                                       min={0}
//                                       value={v.compareAtPrice || ''}
//                                       onChange={e => updateVariant(i, { compareAtPrice: e.target.value })}
//                                       placeholder="—"
//                                       className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-sm text-slate-500 outline-none focus:border-blue-400 transition-colors line-through-placeholder"
//                                     />
//                                   </div>
//                                 </td>

//                                 {/* Stock */}
//                                 <td className="px-4 py-4">
//                                   <input
//                                     type="number"
//                                     min={0}
//                                     value={v.stockQuantity}
//                                     onChange={e => updateVariant(i, { stockQuantity: e.target.value })}
//                                     className={`w-full border rounded-lg px-2.5 py-2 text-sm font-semibold outline-none focus:border-blue-400 transition-colors ${
//                                       stockNum === 0 ? 'bg-red-50 border-red-200 text-red-700'
//                                       : stockNum <= 5 ? 'bg-amber-50 border-amber-200 text-amber-700'
//                                       : 'bg-white border-slate-200 text-slate-700'
//                                     }`}
//                                   />
//                                 </td>

//                                 {/* SKU */}
//                                 <td className="px-4 py-4">
//                                   <input
//                                     value={v.sku}
//                                     onChange={e => updateVariant(i, { sku: e.target.value })}
//                                     className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] font-mono text-slate-600 outline-none focus:border-blue-400 transition-colors"
//                                     placeholder="AUTO"
//                                   />
//                                 </td>

//                                 {/* Delete */}
//                                 <td className="px-4 py-4">
//                                   <button
//                                     onClick={() => removeVariant(i)}
//                                     title="Remove this variant row"
//                                     className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                                     <Trash2 size={14} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardBody>
//           </Card>

//           {/* Technical Specs */}
//           <Card>
//             <CardHeader
//               action={
//                 <button onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
//                   className="text-xs font-bold text-slate-500 hover:text-slate-800">
//                   + Add row
//                 </button>
//               }
//             >
//               Technical Specifications
//             </CardHeader>
//             <CardBody className="space-y-2.5">
//               {specs.map((s, i) => (
//                 <div key={i} className="flex gap-2.5 items-center">
//                   <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)}
//                     className={`${inp} w-[38%]`} placeholder="e.g. Battery Life" />
//                   <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)}
//                     className={`${inp} flex-1`} placeholder="e.g. 30 hours" />
//                   {specs.length > 1 && (
//                     <button onClick={() => setSpecs(p => p.filter((_, j) => j !== i))}
//                       className="text-slate-400 hover:text-red-500 p-1.5 shrink-0 transition-colors">
//                       <X size={14} />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               {!specs.some(s => s.key) && (
//                 <p className="text-[11px] text-slate-400 pl-1">
//                   Add technical specs like Weight, Chip, Screen size, Material…
//                 </p>
//               )}
//             </CardBody>
//           </Card>
//         </div>

//         {/* ════ RIGHT SIDEBAR (1/3) ════ */}
//         <div className="space-y-5">

//           {/* Status */}
//           <Card>
//             <CardHeader>Status</CardHeader>
//             <CardBody className="space-y-2.5">
//               <button onClick={() => setF({ isActive: true })}
//                 className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
//                   form.isActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
//                 }`}>
//                 <CheckCircle size={18} className={form.isActive ? 'text-green-500' : 'text-slate-300'} />
//                 <div>
//                   <p className="text-sm font-bold text-slate-900">Active</p>
//                   <p className="text-[11px] text-slate-500">Visible in store and search</p>
//                 </div>
//               </button>
//               <button onClick={() => setF({ isActive: false })}
//                 className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
//                   !form.isActive ? 'border-slate-400 bg-slate-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
//                 }`}>
//                 <EyeOff size={18} className={!form.isActive ? 'text-slate-600' : 'text-slate-300'} />
//                 <div>
//                   <p className="text-sm font-bold text-slate-900">Draft</p>
//                   <p className="text-[11px] text-slate-500">Hidden from customers</p>
//                 </div>
//               </button>
//             </CardBody>
//           </Card>

//           {/* Inventory */}
//           <Card>
//             <CardHeader>Inventory</CardHeader>
//             <CardBody className="space-y-4">
//               {options.length === 0 ? (
//                 <>
//                   <Field label="Stock Quantity *" hint="How many units do you currently have in stock?">
//                     <input
//                       type="number"
//                       min={0}
//                       value={directInventory.stock}
//                       onChange={e => setDirectInventory(d => ({ ...d, stock: e.target.value }))}
//                       className={inp}
//                       placeholder="e.g. 50"
//                     />
//                   </Field>
//                   <Field label="SKU (Stock Keeping Unit)" hint="Your internal product code. Auto-generated if blank.">
//                     <input
//                       type="text"
//                       value={directInventory.sku}
//                       onChange={e => setDirectInventory(d => ({ ...d, sku: e.target.value }))}
//                       className={`${inp} font-mono`}
//                       placeholder={`${(form.name || 'PRODUCT').split(/\s+/)[0].toUpperCase()}-DEFAULT`}
//                     />
//                   </Field>
//                   <div className={`rounded-xl p-3 text-[11px] font-semibold flex items-start gap-2 ${
//                     parseInt(directInventory.stock) === 0
//                       ? 'bg-red-50 text-red-700 border border-red-100'
//                       : parseInt(directInventory.stock) <= 10
//                       ? 'bg-amber-50 text-amber-700 border border-amber-100'
//                       : 'bg-green-50 text-green-700 border border-green-100'
//                   }`}>
//                     <span className="text-sm leading-none mt-0.5">
//                       {parseInt(directInventory.stock) === 0 ? '🔴' : parseInt(directInventory.stock) <= 10 ? '🟡' : '🟢'}
//                     </span>
//                     <span>
//                       {parseInt(directInventory.stock) === 0
//                         ? 'Out of stock — product will be hidden from purchase'
//                         : parseInt(directInventory.stock) <= 10
//                         ? `Low stock — only ${directInventory.stock} unit(s) remaining`
//                         : `${directInventory.stock} units available`}
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">
//                   <p className="text-xs font-black text-blue-900 mb-1">Stock managed per variant</p>
//                   <p className="text-[11px] text-blue-700">Set Qty for each row in the variant table above. Total stock is calculated automatically.</p>
//                   {variants.length > 0 && (
//                     <p className="text-xs font-bold text-blue-900 mt-2">
//                       {variants.reduce((s, v) => s + (parseInt(v.stockQuantity) || 0), 0)} total units across {variants.length} variant{variants.length !== 1 ? 's' : ''}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </CardBody>
//           </Card>

//           {/* Pricing */}
//           <Card>
//             <CardHeader>Pricing</CardHeader>
//             <CardBody className="space-y-4">
//               <Field label="Base Price (₦) *"
//                 hint={hasVariants ? "Used as fallback reference; variants override per-item pricing" : "Price shown directly on homepage"}>
//                 <div className="relative">
//                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">₦</span>
//                   <input type="number" min={0} step={1} value={form.basePrice}
//                     onChange={e => setF({ basePrice: e.target.value })}
//                     className={`${inp} pl-7`} placeholder="0" />
//                 </div>
//               </Field>

//               <div className="border-t border-dashed border-slate-200 pt-4">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
//                   <Tag size={10} /> Sale Pricing — pick one method
//                 </p>

//                 {/* Method A: manual strikethrough */}
//                 <div className={`rounded-xl border-2 p-3.5 mb-2.5 transition-all ${!form.discount ? 'border-slate-300 bg-slate-50' : 'border-slate-100 opacity-60'}`}>
//                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
//                     A — Manual compare-at price
//                   </p>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">₦</span>
//                     <input type="number" min={0} value={form.compareAtPrice}
//                       onChange={e => { setF({ compareAtPrice: e.target.value, discount: '' }); }}
//                       disabled={!!form.discount}
//                       className={`${inp} pl-7 disabled:cursor-not-allowed`}
//                       placeholder="Original price (shown as strikethrough)" />
//                   </div>
//                   <p className="text-[10px] text-slate-400 mt-1.5">Displays as "was ₦X" — you control both prices.</p>
//                 </div>

//                 {/* Method B: discount % */}
//                 <div className={`rounded-xl border-2 p-3.5 transition-all ${form.discount ? 'border-blue-300 bg-blue-50/50' : 'border-slate-100 opacity-60'}`}>
//                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
//                     B — Discount %
//                   </p>
//                   <div className="relative">
//                     <input type="number" min={0} max={100} value={form.discount}
//                       onChange={e => { setF({ discount: e.target.value, compareAtPrice: '' }); }}
//                       disabled={!!form.compareAtPrice}
//                       className={`${inp} pr-7 disabled:cursor-not-allowed`}
//                       placeholder="e.g. 10" />
//                     <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">%</span>
//                   </div>
//                   {form.discount && form.basePrice ? (
//                     <p className="text-[11px] text-green-700 font-bold mt-1.5">
//                       Sells for ₦{fmt(Math.round(parseFloat(form.basePrice) * (1 - parseFloat(form.discount) / 100)))}
//                       <span className="font-normal text-slate-500 ml-1">(server-calculated)</span>
//                     </p>
//                   ) : (
//                     <p className="text-[10px] text-slate-400 mt-1.5">
//                       Server auto-sets compare-at = base price, then discounts.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardBody>
//           </Card>

//           {/* Organization */}
//           <Card>
//             <CardHeader>Organization</CardHeader>
//             <CardBody className="space-y-4">
//               <Field label="Category">
//                 <select value={form.categorySlug} onChange={e => setF({ categorySlug: e.target.value })} className={inp}>
//                   <option value="">Select a category…</option>
//                   {flatCats.map(c => (
//                     <option key={c.value} value={c.value}>{c.label}</option>
//                   ))}
//                 </select>
//               </Field>

//               <Field label="Brand">
//                 <select value={form.brandSlug} onChange={e => setF({ brandSlug: e.target.value })} className={inp}>
//                   <option value="">Select a brand…</option>
//                   {brands.map(b => (
//                     <option key={b.slug || b.id} value={b.slug}>{b.name}</option>
//                   ))}
//                 </select>
//               </Field>

//               <Field label="Campaign Tags" hint="Comma-separated. Used by campaign engine for targeting.">
//                 <input value={form.tags} onChange={e => setF({ tags: e.target.value })}
//                   className={inp} placeholder="flash-sale, electronics, premium" />
//                 {form.tags.trim() && (
//                   <div className="flex flex-wrap gap-1.5 mt-2">
//                     {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
//                       <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">
//                         <Tag size={9} /> {t}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </Field>
//             </CardBody>
//           </Card>

//           {/* Summary (edit mode only) */}
//           {isEdit && (
//             <Card>
//               <CardHeader>Summary</CardHeader>
//               <CardBody>
//                 <div className="space-y-2 text-sm">
//                   {[
//                     ['Variants', variants.length],
//                     ['Total units', totalUnits],
//                     ['Media files', media.length],
//                     ['Spec rows', specs.filter(s => s.key).length],
//                     ['Tags', form.tags ? form.tags.split(',').filter(Boolean).length : 0],
//                   ].map(([label, val]) => (
//                     <div key={label} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
//                       <span className="text-slate-500">{label}</span>
//                       <span className="font-bold text-slate-800">{val}</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardBody>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* ── FIXED BOTTOM SAVE BAR ── */}
//       <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-lg">
//         <p className="text-xs text-slate-500 font-medium hidden sm:block">
//           {hasVariants
//             ? `${variants.length} variants · ${totalUnits} total units · ${media.length} media`
//             : `${parseInt(directInventory.stock) || 0} units in stock · SKU: ${directInventory.sku || 'auto'} · ${media.length} media`}
//         </p>
//         <div className="flex gap-2.5 ml-auto">
//           <button onClick={onBack}
//             className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
//             Cancel
//           </button>
//           <button onClick={handleSave} disabled={saving}
//             className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-60">
//             {saving
//               ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
//               : (isEdit ? 'Update product' : 'Save product')}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }