import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, Save, Loader2, Upload, Link as LinkIcon, X, Plus,
  Trash2, Power, Image as ImageIcon, AlertCircle, Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../api/axiosConfig';

/**
 * Full editor for a single custom category. Two modes:
 *   - slug=null  → create a new category (POST /v1/admin/custom-catalog/categories)
 *   - slug=...   → edit existing (PUT /v1/admin/custom-catalog/categories/:slug)
 *
 * On the existing-category screen we embed StylesManager which lets the admin
 * add/edit/remove the gallery items shown to customers in the wizard.
 */
const CategoryEditor = ({ slug, onClose, onSaved }) => {
  const isNew = !slug;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankCategory());
  const [styles, setStyles] = useState([]);
  const [orderCount, setOrderCount] = useState(0);

  const fetchCategory = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api.get(`/v1/admin/custom-catalog/categories/${slug}`);
      const data = res.data;
      setForm({
        slug: data.slug || '',
        name: data.name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        genderHint: data.genderHint || 'unisex',
        priceFrom: data.priceFrom != null ? String(data.priceFrom) : '',
        leadTime: data.leadTime || '',
        accent: data.accent || '#0d4d2a',
        coverImageUrl: data.coverImageUrl || '',
        coverImagePublicId: data.coverImagePublicId || '',
        measurementSet: data.measurementSet || 'menFull',
        sortOrder: data.sortOrder ?? 100,
        active: data.active !== false,
      });
      setStyles(data.sampleStyles || []);
      setOrderCount(data.orderCount || 0);
    } catch (err) {
      console.error('Failed to load category', err);
      toast.error('Could not load category.');
    } finally {
      setLoading(false);
    }
  }, [slug, isNew]);

  useEffect(() => { fetchCategory(); }, [fetchCategory]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ─── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Frontend validation — backend will also validate
    if (!form.name?.trim()) { toast.error('Name is required.'); return; }
    if (isNew && !form.slug?.trim()) { toast.error('Slug is required for new categories.'); return; }
    if (isNew && !/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error('Slug must be lowercase letters, numbers, or hyphens only.');
      return;
    }

    const payload = {
      ...form,
      // Send slug only on create — backend ignores it on update
      slug: isNew ? form.slug.trim().toLowerCase() : undefined,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : null,
      sortOrder: form.sortOrder != null ? Number(form.sortOrder) : 100,
    };

    try {
      setSaving(true);
      if (isNew) {
        await api.post('/v1/admin/custom-catalog/categories', payload);
        toast.success(`${form.name} created.`);
      } else {
        await api.put(`/v1/admin/custom-catalog/categories/${slug}`, payload);
        toast.success(`${form.name} updated.`);
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading category…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-900 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.15em] text-stone-500">
            {isNew ? 'New category' : `Editing · ${form.slug}`}
          </div>
          <div className="font-display text-2xl text-stone-900 truncate">
            {form.name || 'Untitled category'}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/60 text-white text-sm font-medium rounded-sm transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Order count warning */}
      {!isNew && orderCount > 0 && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-sm p-4 flex gap-3 text-sm text-emerald-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">{orderCount} order{orderCount === 1 ? '' : 's'}</span>{' '}
            already reference this category. You can edit anything here, but the slug is locked and the
            category cannot be deleted (only deactivated).
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* Identity */}
        <Section title="Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            {isNew && (
              <Field label="Slug *" hint="Lowercase, hyphens only. Cannot change later. Used in URLs.">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="agbada"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Name *" hint="Shown on the customer-facing card.">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Agbada"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Tagline" hint="Short evocative line. Shown under the category name.">
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setField('tagline', e.target.value)}
              placeholder="Flowing grandeur, ceremonial weight"
              className={inputClass}
            />
          </Field>
          <Field label="Description" hint="Longer paragraph for the category page.">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </Section>

        {/* Pricing & lead time */}
        <Section title="Pricing & Lead Time">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Price from (₦)" hint="Hint shown on the card. Real quote comes from admin.">
              <input
                type="number"
                step="500"
                value={form.priceFrom}
                onChange={(e) => setField('priceFrom', e.target.value)}
                placeholder="22000"
                className={inputClass}
              />
            </Field>
            <Field label="Lead time" hint="Free text — '7-14 days', '14-21 days'.">
              <input
                type="text"
                value={form.leadTime}
                onChange={(e) => setField('leadTime', e.target.value)}
                placeholder="7-14 days"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* Targeting */}
        <Section title="Targeting & Measurements">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Gender">
              <select
                value={form.genderHint}
                onChange={(e) => setField('genderHint', e.target.value)}
                className={inputClass}
              >
                <option value="men">For men</option>
                <option value="women">For women</option>
                <option value="unisex">Unisex (customer picks at submit)</option>
              </select>
            </Field>
            <Field label="Measurement set" hint="Must match a key in the frontend MEASUREMENT_SETS.">
              <select
                value={form.measurementSet}
                onChange={(e) => setField('measurementSet', e.target.value)}
                className={inputClass}
              >
                <option value="menFull">Men · Full body</option>
                <option value="womenFull">Women · Full body</option>
                <option value="womenUpperLower">Women · Upper + lower</option>
                <option value="unisexUpperLong">Unisex · Long top</option>
                <option value="unisexUpperShort">Unisex · Short top</option>
                <option value="unisexLower">Unisex · Lower only</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Cover image */}
        <Section title="Cover Image">
          <ImageInput
            url={form.coverImageUrl}
            publicId={form.coverImagePublicId}
            onChange={(url, publicId) => {
              setField('coverImageUrl', url);
              setField('coverImagePublicId', publicId || '');
            }}
            folder="custom-catalog/categories"
          />
        </Section>

        {/* Display */}
        <Section title="Display">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Accent colour" hint="Used for card gradient & silhouette tint.">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accent || '#0d4d2a'}
                  onChange={(e) => setField('accent', e.target.value)}
                  className="w-12 h-10 border border-stone-200 rounded-sm cursor-pointer"
                />
                <input
                  type="text"
                  value={form.accent}
                  onChange={(e) => setField('accent', e.target.value)}
                  placeholder="#0d4d2a"
                  className={`${inputClass} flex-1`}
                />
              </div>
            </Field>
            <Field label="Sort order" hint="Lower = earlier in grid.">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => setField('active', !form.active)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-sm text-sm font-medium transition ${
                  form.active
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-300 bg-stone-50 text-stone-600'
                }`}
              >
                <Power className="w-4 h-4" strokeWidth={1.5} />
                {form.active ? 'Active' : 'Inactive'}
              </button>
            </Field>
          </div>
        </Section>

        {/* Styles manager — only on existing categories */}
        {!isNew && (
          <Section title="Gallery Styles" subtitle="Items the customer picks from in the wizard.">
            <StylesManager categorySlug={slug} styles={styles} onChange={setStyles} />
          </Section>
        )}

        {isNew && (
          <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-sm text-stone-600 flex gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>Save the category first. You can add gallery styles after.</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════
//  StylesManager — embedded inside the category editor
// ═════════════════════════════════════════════════════════════════════════

const StylesManager = ({ categorySlug, styles, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const res = await api.get(`/v1/admin/custom-catalog/categories/${categorySlug}/styles`);
      onChange(res.data || []);
    } catch (err) {
      console.error('Failed to reload styles', err);
    }
  }, [categorySlug, onChange]);

  const handleDelete = async (style) => {
    if (!window.confirm(`Delete style "${style.name}"? Existing orders that reference it will keep their data.`)) return;
    try {
      await api.delete(`/v1/admin/custom-catalog/styles/${style.slug}`);
      toast.success(`${style.name} deleted.`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete style.');
    }
  };

  const handleToggleActive = async (style) => {
    try {
      await api.put(`/v1/admin/custom-catalog/styles/${style.slug}`, {
        ...style,
        active: !style.active,
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not toggle style.');
    }
  };

  return (
    <div>
      {/* Existing styles */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {styles.map((style) => (
          editingSlug === style.slug ? (
            <StyleForm
              key={style.slug}
              categorySlug={categorySlug}
              existing={style}
              onCancel={() => setEditingSlug(null)}
              onSaved={() => { setEditingSlug(null); refetch(); }}
            />
          ) : (
            <div
              key={style.slug}
              className={`bg-white border border-stone-200 rounded-sm overflow-hidden ${!style.active ? 'opacity-60' : ''}`}
            >
              <div className="aspect-[4/3] bg-stone-100">
                {style.imageUrl ? (
                  <img
                    src={style.imageUrl}
                    alt={style.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-6 h-6" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div className="font-medium text-sm text-stone-900 truncate">{style.name}</div>
                  {!style.active && (
                    <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Hidden</span>
                  )}
                </div>
                {style.tone && <div className="text-xs text-stone-500 mb-3 line-clamp-1">{style.tone}</div>}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditingSlug(style.slug)}
                    className="flex-1 px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs rounded-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(style)}
                    className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs rounded-sm transition"
                    title={style.active ? 'Hide' : 'Show'}
                  >
                    <Power className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(style)}
                    className="px-2 py-1.5 bg-stone-100 hover:bg-red-100 hover:text-red-700 text-xs rounded-sm transition"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Add-style card */}
        {adding ? (
          <StyleForm
            categorySlug={categorySlug}
            onCancel={() => setAdding(false)}
            onSaved={() => { setAdding(false); refetch(); }}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="aspect-[4/3] border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-emerald-50/40 rounded-sm flex flex-col items-center justify-center text-stone-500 hover:text-emerald-800 transition"
          >
            <Plus className="w-6 h-6 mb-1" strokeWidth={1.5} />
            <span className="text-xs font-medium">Add style</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Style form (used for both create and edit) ─────────────────────────

const StyleForm = ({ categorySlug, existing, onCancel, onSaved }) => {
  const isEdit = !!existing;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: existing?.slug || '',
    name: existing?.name || '',
    tone: existing?.tone || '',
    imageUrl: existing?.imageUrl || '',
    imagePublicId: existing?.imagePublicId || '',
    description: existing?.description || '',
    sortOrder: existing?.sortOrder ?? 100,
    active: existing?.active !== false,
  });

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name is required.'); return; }
    if (!isEdit && !form.slug?.trim()) { toast.error('Slug is required.'); return; }
    if (!isEdit && !/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error('Slug must be lowercase letters, numbers, or hyphens only.');
      return;
    }

    const payload = {
      ...form,
      slug: isEdit ? undefined : form.slug.trim().toLowerCase(),
      sortOrder: Number(form.sortOrder) || 100,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/v1/admin/custom-catalog/styles/${existing.slug}`, payload);
        toast.success(`${form.name} updated.`);
      } else {
        await api.post(`/v1/admin/custom-catalog/categories/${categorySlug}/styles`, payload);
        toast.success(`${form.name} added.`);
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save style.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-emerald-700 rounded-sm p-3 sm:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-sm text-stone-900">
          {isEdit ? `Edit · ${existing.slug}` : 'New style'}
        </div>
        <button
          onClick={onCancel}
          className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {!isEdit && (
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="agbada-classic-royal"
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Classic Royal"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Tone</label>
          <input
            type="text"
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
            placeholder="Cream / Gold embroidery"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Image</label>
          <ImageInput
            url={form.imageUrl}
            publicId={form.imagePublicId}
            onChange={(url, publicId) => setForm({ ...form, imageUrl: url, imagePublicId: publicId || '' })}
            folder="custom-catalog/styles"
          />
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Active</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, active: !form.active })}
            className={`w-full px-3 py-2 border rounded-sm text-sm transition ${
              form.active ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-300 bg-stone-50 text-stone-600'
            }`}
          >
            {form.active ? 'Visible' : 'Hidden'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm rounded-sm transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/60 text-white text-sm font-medium rounded-sm transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add style')}
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════
//  ImageInput — Upload-to-Cloudinary OR Paste-URL toggle
// ═════════════════════════════════════════════════════════════════════════

const ImageInput = ({ url, publicId, onChange, folder }) => {
  const [mode, setMode] = useState(publicId ? 'upload' : (url ? 'url' : 'upload'));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      // Re-using the existing /v1/custom-uploads endpoint your project already exposes
      // for style references. Returns { url, publicId }.
      const res = await api.post('/v1/custom-uploads/style-reference', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url, res.data.publicId);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Try a smaller file or paste a URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => onChange('', '');

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3 p-1 bg-stone-100 rounded-sm w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sm transition flex items-center gap-1.5 ${
            mode === 'upload' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Upload className="w-3 h-3" strokeWidth={1.5} />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sm transition flex items-center gap-1.5 ${
            mode === 'url' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <LinkIcon className="w-3 h-3" strokeWidth={1.5} />
          Paste URL
        </button>
      </div>

      {/* Preview */}
      {url ? (
        <div className="relative inline-block mb-3">
          <img
            src={url}
            alt="preview"
            className="max-w-xs max-h-48 object-cover rounded-sm border border-stone-200"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-900/80 hover:bg-stone-900 flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : null}

      {/* Input */}
      {mode === 'upload' ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-emerald-900 disabled:bg-stone-400 text-white text-sm font-medium rounded-sm transition"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : (url ? 'Replace image' : 'Choose file')}
          </button>
          <div className="text-xs text-stone-500 mt-1.5">JPG / PNG · max 5MB · uploads to Cloudinary</div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value, '')}
            placeholder="https://images.unsplash.com/..."
            className={inputClass}
          />
          <div className="text-xs text-stone-500 mt-1.5">External URL (Unsplash, Cloudinary, etc.)</div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════
//  Layout primitives
// ═════════════════════════════════════════════════════════════════════════

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white border border-stone-200 rounded-sm p-5 sm:p-6">
    <div className="mb-4">
      <div className="font-display text-lg text-stone-900">{title}</div>
      {subtitle && <div className="text-xs text-stone-500 mt-0.5">{subtitle}</div>}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {hint && <div className="text-xs text-stone-500 mt-1">{hint}</div>}
  </div>
);

const inputClass =
  'w-full px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition';
const labelClass = 'block text-xs uppercase tracking-[0.12em] text-stone-500 mb-1.5 font-medium';

const blankCategory = () => ({
  slug: '',
  name: '',
  tagline: '',
  description: '',
  genderHint: 'unisex',
  priceFrom: '',
  leadTime: '',
  accent: '#0d4d2a',
  coverImageUrl: '',
  coverImagePublicId: '',
  measurementSet: 'menFull',
  sortOrder: 100,
  active: true,
});

export default CategoryEditor;