import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Power, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../api/axiosConfig';
import CategoryEditor from './CategoryEditor';

/**
 * Admin tab for managing custom-tailoring categories (Agbada, Senator, Suit, etc.)
 * AND the styles inside each category. Backend endpoints:
 *   GET    /v1/admin/custom-catalog/categories
 *   POST   /v1/admin/custom-catalog/categories
 *   PUT    /v1/admin/custom-catalog/categories/{slug}
 *   DELETE /v1/admin/custom-catalog/categories/{slug}     (blocked if orders exist)
 *
 * Two views:
 *  - List view (this component) — shows all categories incl. inactive, with order counts
 *  - Editor view (CategoryEditor) — full edit form with embedded styles manager
 */
const AdminCustomCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState(null); // null = list, "new" = create, slug = edit
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/admin/custom-catalog/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Could not load custom categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/v1/admin/custom-catalog/categories/${cat.slug}`, {
        ...cat,
        active: !cat.active,
      });
      toast.success(`${cat.name} is now ${!cat.active ? 'active' : 'inactive'}`);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not toggle category status.');
    }
  };

  const handleDelete = async (cat) => {
    if (cat.orderCount > 0) {
      toast.error(`Cannot delete — ${cat.orderCount} order(s) reference this category. Deactivate instead.`);
      return;
    }
    if (!window.confirm(`Delete "${cat.name}"? This will also remove all its styles. This cannot be undone.`)) return;

    try {
      setDeleting(cat.slug);
      await api.delete(`/v1/admin/custom-catalog/categories/${cat.slug}`);
      toast.success(`${cat.name} deleted.`);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category.');
    } finally {
      setDeleting(null);
    }
  };

  // ─── Editor mode ─────────────────────────────────────────────────────
  if (editingSlug !== null) {
    return (
      <CategoryEditor
        slug={editingSlug === 'new' ? null : editingSlug}
        onClose={() => setEditingSlug(null)}
        onSaved={() => { setEditingSlug(null); fetchCategories(); }}
      />
    );
  }

  // ─── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading custom catalog…
      </div>
    );
  }

  // ─── Empty state ─────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-sm p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-stone-500" strokeWidth={1.5} />
        </div>
        <div className="font-display text-2xl text-stone-900 mb-2">No custom categories yet</div>
        <div className="text-sm text-stone-600 max-w-md mx-auto mb-6">
          The seeder should populate 11 categories on first boot. If you've cleared the collection, restart the
          backend or add a category manually below.
        </div>
        <button
          onClick={() => setEditingSlug('new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-emerald-900 text-white text-sm font-medium rounded-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>
    );
  }

  // ─── List view ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-1">Custom Catalog</div>
          <div className="font-display text-2xl text-stone-900">Categories &amp; Styles</div>
          <div className="text-sm text-stone-500 mt-1">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} ·{' '}
            {categories.filter((c) => c.active).length} active
          </div>
        </div>
        <button
          onClick={() => setEditingSlug('new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-emerald-900 text-white text-sm font-medium rounded-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      {/* Category cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className={`bg-white border rounded-sm overflow-hidden transition ${
              cat.active ? 'border-stone-200' : 'border-stone-200 opacity-60'
            }`}
          >
            {/* Cover image */}
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
              {cat.coverImageUrl ? (
                <img
                  src={cat.coverImageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-stone-400"
                  style={{ background: cat.accent ? `${cat.accent}10` : undefined }}
                >
                  <ImageIcon className="w-8 h-8" strokeWidth={1.2} />
                </div>
              )}
              {!cat.active && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-stone-900/80 text-white text-[10px] uppercase tracking-[0.15em] rounded-sm">
                  Inactive
                </div>
              )}
              {cat.orderCount > 0 && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] uppercase tracking-[0.15em] rounded-sm">
                  {cat.orderCount} order{cat.orderCount === 1 ? '' : 's'}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="font-display text-xl text-stone-900 truncate">{cat.name}</div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 shrink-0">
                  {cat.genderHint}
                </span>
              </div>
              {cat.tagline && <div className="text-sm text-stone-600 mb-3 line-clamp-1">{cat.tagline}</div>}

              <div className="flex items-baseline justify-between text-xs text-stone-500 mb-4">
                <span>From <span className="font-medium text-stone-700">₦{Number(cat.priceFrom || 0).toLocaleString()}</span></span>
                <span>{cat.leadTime || '—'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSlug(cat.slug)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-emerald-900 text-white text-xs font-medium rounded-sm transition"
                >
                  <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(cat)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-sm transition"
                  title={cat.active ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deleting === cat.slug || cat.orderCount > 0}
                  className="px-3 py-2 bg-stone-100 hover:bg-red-100 hover:text-red-700 text-stone-700 text-xs rounded-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title={cat.orderCount > 0 ? `Has ${cat.orderCount} order(s) — cannot delete` : 'Delete'}
                >
                  {deleting === cat.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-8 bg-stone-50 border border-stone-200 rounded-sm p-4 flex gap-3 text-xs text-stone-600 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          Categories with attached orders cannot be deleted — deactivate them instead to hide from /custom while
          preserving order history. Edit a category to manage its styles (the gallery items shown to customers).
        </div>
      </div>
    </div>
  );
};

export default AdminCustomCatalog;