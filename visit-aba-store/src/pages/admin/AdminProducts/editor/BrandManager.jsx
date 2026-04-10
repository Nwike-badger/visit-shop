import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  Tag, Plus, Pencil, Trash2, Loader2, X, Search,
  RefreshCw, Globe, Image as ImageIcon, Hash,
  ShieldAlert, AlertTriangle, CheckCircle2, Package,
  ArrowLeft, ExternalLink,
} from 'lucide-react';
import { getErr, slugify } from '../utils';
import { Card, CardHeader, Field } from '../SharedUI';

/* ─────────────────────────────────────────────────────────────────
   Brand Form Modal (Create + Edit)
───────────────────────────────────────────────────────────────── */
const INP = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300';

function BrandFormModal({ mode, initialData, onSave, onClose, saving }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name:        initialData?.name        || '',
    slug:        initialData?.slug        || '',
    description: initialData?.description || '',
    logoUrl:     initialData?.logoUrl     || '',
    website:     initialData?.website     || '',
  });
  const [slugManual, setSlugManual] = useState(isEdit);

  const setF = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleNameChange = (val) => {
    setF({ name: val, ...(!slugManual ? { slug: slugify(val) } : {}) });
  };

  const canSubmit = form.name.trim() && form.slug.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <Tag size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-none">
                {isEdit ? `Edit "${initialData?.name}"` : 'New Brand'}
              </h3>
              {isEdit && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{initialData?.slug}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Name */}
          <Field label="Brand Name" required>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              className={INP}
              placeholder="e.g. Nike"
              autoFocus
            />
          </Field>

          {/* Slug — read-only on edit (products reference it) */}
          <Field
            label="URL Slug"
            hint={isEdit
              ? 'Slug is locked after creation — products reference it by slug.'
              : 'Auto-generated. Used in URLs and as the product link key.'}
          >
            <div className="relative">
              <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.slug}
                onChange={e => { setSlugManual(true); setF({ slug: slugify(e.target.value) }); }}
                readOnly={isEdit}
                className={`${INP} pl-8 font-mono text-[13px] ${isEdit ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                placeholder="nike"
              />
            </div>
          </Field>

          {/* Logo URL */}
          <Field label="Logo URL" hint="Square logo, minimum 200×200px recommended.">
            <div className="flex gap-2 items-start">
              <div className="relative flex-1">
                <ImageIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.logoUrl}
                  onChange={e => setF({ logoUrl: e.target.value })}
                  className={`${INP} pl-8`}
                  placeholder="https://…"
                />
              </div>
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt="logo preview"
                  className="w-11 h-11 rounded-xl object-contain border border-slate-200 bg-slate-50 shrink-0 p-1"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </Field>

          {/* Website */}
          <Field label="Website" hint="Optional. Displayed on brand pages.">
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.website}
                onChange={e => setF({ website: e.target.value })}
                className={`${INP} pl-8`}
                placeholder="https://nike.com"
                type="url"
              />
            </div>
          </Field>

          {/* Description */}
          <Field label="Description" hint="Short brand bio — shown on brand listing pages.">
            <textarea
              value={form.description}
              onChange={e => setF({ description: e.target.value })}
              className={`${INP} resize-none h-[72px]`}
              placeholder="A brief description of this brand…"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-[10px] text-slate-400">
            {isEdit
              ? 'Slug cannot be changed — it links to existing products.'
              : 'Brand will be available immediately for product assignment.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !canSubmit}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {isEdit ? 'Save changes' : 'Create brand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Delete Confirmation
───────────────────────────────────────────────────────────────── */
function DeleteDialog({ brand, productCount, onConfirm, onClose, deleting }) {
  const isBlocked = productCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className={`px-6 py-5 flex items-start gap-4 ${isBlocked ? 'bg-amber-50 border-b border-amber-100' : 'bg-red-50 border-b border-red-100'}`}>
          {isBlocked
            ? <ShieldAlert size={22} className="text-amber-500 shrink-0 mt-0.5" />
            : <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />}
          <div>
            <h3 className="font-bold text-slate-900">
              {isBlocked ? 'Cannot delete this brand' : 'Delete this brand?'}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {isBlocked ? (
                <>
                  <strong>"{brand.name}"</strong> is assigned to{' '}
                  <strong>{productCount} product{productCount > 1 ? 's' : ''}</strong>.
                  Reassign or remove those products first.
                </>
              ) : (
                <>
                  <strong>"{brand.name}"</strong> will be permanently deleted. This cannot be undone.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isBlocked ? 'Got it' : 'Cancel'}
          </button>
          {!isBlocked && (
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete permanently
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Brand Row Card
───────────────────────────────────────────────────────────────── */
function BrandRow({ brand, productCount, onEdit, onDelete }) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors border-t border-slate-50 first:border-t-0">

      {/* Logo */}
      <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-slate-300 transition-colors">
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-full h-full object-contain p-1"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`${brand.logoUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <Tag size={16} className="text-slate-300" />
        </div>
      </div>

      {/* Name + slug */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 text-sm truncate">{brand.name}</p>
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-slate-300 hover:text-blue-500 transition-colors"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{brand.slug}</p>
        {brand.description && (
          <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[360px]">{brand.description}</p>
        )}
      </div>

      {/* Product count badge */}
      <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
        <Package size={11} className="text-slate-400" />
        {productCount ?? '—'}
        <span className="font-medium text-slate-400">products</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(brand)}
          title="Edit brand"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(brand)}
          title={productCount > 0 ? `${productCount} products use this brand` : 'Delete brand'}
          className={`p-1.5 rounded-lg transition-colors ${
            productCount > 0
              ? 'text-slate-200 cursor-not-allowed'
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BrandManager — main export
───────────────────────────────────────────────────────────────── */
export default function BrandManager({ onBack }) {
  const [brands,       setBrands]       = useState([]);
  const [productCounts,setProductCounts]= useState({});   // { [slug]: count }
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');

  const [modal,        setModal]        = useState(null); // { mode, initialData }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  /* ── Fetch brands + product counts ── */
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      const list = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setBrands(list);

      // Fetch product counts in parallel (fire-and-forget per brand)
      const counts = {};
      await Promise.allSettled(
        list.map(async (b) => {
          try {
            const c = await api.get(`/brands/${b.slug}/product-count`);
            counts[b.slug] = c.data.count ?? 0;
          } catch {
            counts[b.slug] = 0;
          }
        })
      );
      setProductCounts(counts);
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  /* ── Save (create or edit) ── */
  const handleSave = async (form) => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        slug:        form.slug.trim(),
        description: form.description.trim() || null,
        logoUrl:     form.logoUrl.trim()     || null,
        website:     form.website.trim()     || null,
      };

      if (modal.mode === 'create') {
        await api.post('/brands', payload);
        toast.success(`"${form.name}" created!`);
      } else {
        await api.put(`/brands/${modal.initialData.slug}`, payload);
        toast.success(`"${form.name}" updated!`);
      }

      setModal(null);
      await fetchBrands();
    } catch (err) {
      toast.error(getErr(err) || 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/brands/${deleteTarget.slug}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await fetchBrands();
    } catch (err) {
      toast.error(getErr(err) || 'Failed to delete brand');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Filtered list ── */
  const filtered = brands.filter(b =>
    !search ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.slug?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Stats ── */
  const totalProducts = Object.values(productCounts).reduce((s, c) => s + c, 0);
  const withProducts  = brands.filter(b => (productCounts[b.slug] || 0) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50/80 pb-16 font-sans">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <ArrowLeft size={17} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
            <Tag size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Brands</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage product brands</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBrands}
            className="p-2 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModal({ mode: 'create', initialData: null })}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/15"
          >
            <Plus size={14} /> Add brand
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total brands',       val: brands.length,  color: 'text-slate-800', bg: 'bg-white border-slate-200' },
            { label: 'Brands with products', val: withProducts, color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
            { label: 'Products branded',   val: totalProducts,  color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl px-4 py-3.5 border ${s.bg}`}>
              <p className={`text-2xl font-black leading-none ${s.color}`}>{s.val}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brands by name or slug…"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Brand list */}
        <Card>
          <CardHeader
            subtitle={`${filtered.length} brand${filtered.length !== 1 ? 's' : ''}`}
            action={
              <button
                onClick={() => setModal({ mode: 'create', initialData: null })}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add brand
              </button>
            }
          >
            All Brands
          </CardHeader>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-blue-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Tag size={28} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-semibold text-sm">
                {search ? `No brands match "${search}"` : 'No brands yet'}
              </p>
              {!search && (
                <button
                  onClick={() => setModal({ mode: 'create', initialData: null })}
                  className="mt-5 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-md"
                >
                  Create your first brand
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(brand => (
                <BrandRow
                  key={brand.id || brand.slug}
                  brand={brand}
                  productCount={productCounts[brand.slug] ?? 0}
                  onEdit={(b) => setModal({ mode: 'edit', initialData: b })}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Slug immutability note */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-2.5">
          <Hash size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
            <strong>Brand slugs are permanent.</strong> Products link to brands via slug.
            Changing a slug would orphan those products. If you need to rename a brand,
            use the Edit form — only the display name changes, the slug stays fixed.
          </p>
        </div>

      </div>

      {/* Modals */}
      {modal && (
        <BrandFormModal
          mode={modal.mode}
          initialData={modal.initialData}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          brand={deleteTarget}
          productCount={productCounts[deleteTarget.slug] ?? 0}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}