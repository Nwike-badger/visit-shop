import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { slugify, getErr, inp } from './utils';

// Editor sub-components
import BasicInfoCard    from './editor/BasicInfoCard';
import MediaGalleryCard from './editor/MediaGalleryCard';
import VariantsCard     from './editor/VariantsCard';
import SpecsCard        from './editor/SpecsCard';
import StatusCard       from './editor/StatusCard';
import InventoryCard    from './editor/InventoryCard';
import PricingCard      from './editor/PricingCard';
import OrganizationCard from './editor/OrganizationCard';
import SummaryCard      from './editor/SummaryCard';
import { flattenTree }  from './utils';

export default function ProductEditor({ productId, onBack, categories, brands }) {
  const isEdit = !!productId;
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', slug: '', description: '',
    basePrice: '', compareAtPrice: '', discount: '',
    categorySlug: '', brandSlug: '',
    tags: '', isActive: true,
  });
  const setF = (patch) => setForm(f => ({ ...f, ...patch }));

  const [media,           setMedia]           = useState([]);
  const [mediaInput,      setMediaInput]      = useState('');
  const [options,         setOptions]         = useState([]);
  const [variants,        setVariants]        = useState([]);
  const [specs,           setSpecs]           = useState([{ key: '', value: '' }]);
  const [bulkPrice,       setBulkPrice]       = useState('');
  const [bulkStock,       setBulkStock]       = useState('');
  const [directInventory, setDirectInventory] = useState({ variantId: null, sku: '', stock: '0' });

  const slugEdited = useRef(false);
  const flatCats   = flattenTree(categories);

  // ── Load existing product ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        const p   = res.data.product ?? res.data;
        const v   = res.data.variants ?? [];

        slugEdited.current = true;

        setF({
          name:           p.name           || '',
          slug:           p.slug           || '',
          description:    p.description    || '',
          basePrice:      p.basePrice      ?? '',
          compareAtPrice: p.compareAtPrice ?? '',
          discount:       p.discount > 0   ? String(p.discount) : '',
          categorySlug:   p.categorySlug   || '',
          brandSlug:      p.brand?.slug    || brands.find(b => b.name === p.brandName)?.slug || '',
          tags:           Array.isArray(p.tags) ? p.tags.join(', ') : '',
          isActive:       p.active !== false,
        });

        setMedia((p.images || []).map(img => ({
          url:       img.url,
          isPrimary: !!(img.isPrimary ?? img.primary),
          type:      img.type ?? img.mediaType ?? 'IMAGE',
        })));

        const loadedOptions = (p.variantOptions || []).map(o => ({ name: o.name, values: o.values }));
        setOptions(loadedOptions);

        if (loadedOptions.length > 0) {
          setVariants(v.map(vt => ({
            id:             vt.id,
            sku:            vt.sku            || '',
            price:          vt.price          ?? '',
            compareAtPrice: vt.compareAtPrice ?? '',
            stockQuantity:  vt.stockQuantity  ?? 0,
            attributes:     vt.attributes     || {},
            isActive:       vt.active !== false,
            imageUrl:       (vt.images || []).find(i => i.isPrimary ?? i.primary)?.url || '',
          })));
        } else {
          const defaultVariant = v.find(vt => Object.keys(vt.attributes || {}).length === 0) || v[0];
          if (defaultVariant) {
            setDirectInventory({
              variantId: defaultVariant.id,
              sku:       defaultVariant.sku || '',
              stock:     String(defaultVariant.stockQuantity ?? 0),
            });
          }
          setVariants([]);
        }

        if (p.specifications && Object.keys(p.specifications).length) {
          setSpecs(Object.entries(p.specifications).map(([k, val]) => ({ key: k, value: val })));
        }
      } catch {
        toast.error('Failed to load product');
        onBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]); // eslint-disable-line

  // ── Auto-slug ───────────────────────────────────────────────────────────────
  const handleNameChange = (val) => {
    if (!slugEdited.current) {
      setF({ name: val, slug: slugify(val) });
    } else {
      setF({ name: val });
    }
  };

  // ── Option handlers (chip-based) ────────────────────────────────────────────
  const addOption = () => setOptions(prev => [...prev, { name: '', values: [] }]);

  const updateOptionName = (i, name) =>
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, name } : o));

  const addOptionValue = (i, val) => {
    const clean = val.trim();
    if (!clean) return;
    setOptions(prev => prev.map((o, idx) => {
      if (idx === i && !o.values.includes(clean)) return { ...o, values: [...o.values, clean] };
      return o;
    }));
  };

  const removeOptionValue = (i, valIdx) => {
    setOptions(prev => prev.map((o, idx) =>
      idx === i ? { ...o, values: o.values.filter((_, vIdx) => vIdx !== valIdx) } : o
    ));
  };

  const removeOption = (i) => setOptions(prev => prev.filter((_, idx) => idx !== i));

  // ── Sync variants from options (explicit) ───────────────────────────────────
  const syncVariants = () => {
    const valid = options.filter(o => o.name.trim() && o.values.length > 0);

    if (valid.length === 0) {
      if (window.confirm('This will clear your variant table. Continue?')) setVariants([]);
      return;
    }

    const keys      = valid.map(o => o.name.trim());
    const valArrays = valid.map(o => o.values);
    const cartesian = (arrs) => arrs.reduce((acc, arr) => acc.flatMap(c => arr.map(v => [...c, v])), [[]]);

    const combos = cartesian(valArrays).map(vals => {
      const attrs = {};
      keys.forEach((k, i) => { attrs[k] = vals[i]; });
      return attrs;
    });

    setVariants(prev =>
      combos.map(combo => {
        const existing = prev.find(pv => JSON.stringify(pv.attributes) === JSON.stringify(combo));
        if (existing) return existing;
        const namePart = (form.name || 'SKU').split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const attrPart = Object.values(combo).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
        return {
          sku: `${namePart}-${attrPart}`,
          price: form.basePrice || '',
          compareAtPrice: '',
          stockQuantity: 0,
          attributes: combo,
          isActive: true,
          imageUrl: '',
        };
      })
    );
    toast.success('Variants synchronised!');
  };

  // ── Media handlers ──────────────────────────────────────────────────────────
  const addMedia = (e) => {
    e?.preventDefault();
    const url = mediaInput.trim();
    if (!url) return;
    const isVideo =
      url.includes('youtube.com') || url.includes('youtu.be') ||
      url.includes('vimeo.com')   || /\.(mp4|webm|mov)$/i.test(url);
    setMedia(prev => [...prev, { url, isPrimary: prev.length === 0, type: isVideo ? 'VIDEO' : 'IMAGE' }]);
    setMediaInput('');
  };

  const removeMedia = (i) => {
    setMedia(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length > 0 && !next.some(m => m.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return next;
    });
  };

  const setPrimary = (i) => setMedia(prev => prev.map((m, idx) => ({ ...m, isPrimary: idx === i })));

  // ── Variant helpers ─────────────────────────────────────────────────────────
  const updateVariant = (i, patch) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v));

  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const applyBulk = () => {
    if (!bulkPrice && !bulkStock) return;
    setVariants(prev => prev.map(v => ({
      ...v,
      ...(bulkPrice !== '' ? { price: bulkPrice } : {}),
      ...(bulkStock !== '' ? { stockQuantity: bulkStock } : {}),
    })));
    setBulkPrice(''); setBulkStock('');
    toast.success('Bulk values applied to all variants');
  };

  // ── Spec helpers ────────────────────────────────────────────────────────────
  const updateSpec = (i, field, val) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim())  { toast.error('Product name is required'); return; }
    if (!form.basePrice)    { toast.error('Base price is required');   return; }
    if (options.length > 0 && variants.some(v => !v.sku.trim())) {
      toast.error('All variants need a SKU'); return;
    }

    setSaving(true);
    try {
      const variantOptions = {};
      options.forEach(o => { if (o.name.trim() && o.values.length > 0) variantOptions[o.name.trim()] = o.values; });

      const specifications = {};
      specs.forEach(s => { if (s.key.trim()) specifications[s.key.trim()] = s.value.trim(); });

      const images = media.map(m => ({
        url: m.url, isPrimary: !!m.isPrimary, type: m.type || 'IMAGE', altText: form.name,
      }));

      const productPayload = {
        id:             productId || null,
        name:           form.name.trim(),
        slug:           form.slug.trim() || slugify(form.name),
        description:    form.description.trim(),
        basePrice:      parseFloat(form.basePrice) || 0,
        compareAtPrice: (!form.discount && form.compareAtPrice) ? parseFloat(form.compareAtPrice) || null : null,
        discount:       form.discount ? parseFloat(form.discount) : null,
        categorySlug:   form.categorySlug || null,
        brandSlug:      form.brandSlug    || null,
        isActive:       form.isActive,
        tags:           form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images,
        specifications: Object.keys(specifications).length ? specifications : {},
        variantOptions: Object.keys(variantOptions).length ? variantOptions  : {},
      };

      const res            = await api.post('/products', productPayload);
      const savedProductId = res.data.id;
      if (!savedProductId) throw new Error('Product saved but no ID returned from server');

      if (options.length > 0 && variants.length > 0) {
        const errors = [];
        for (const v of variants) {
          const variantImages = v.imageUrl
            ? [{ url: v.imageUrl, isPrimary: true, type: 'IMAGE', altText: v.sku }]
            : images;
          try {
            await api.post('/products/variants', {
              id:             v.id || null,
              productId:      savedProductId,
              sku:            v.sku.trim(),
              price:          parseFloat(v.price) || 0,
              compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) || null : null,
              stockQuantity:  parseInt(v.stockQuantity) || 0,
              attributes:     v.attributes,
              isActive:       v.isActive,
              images:         variantImages,
            });
          } catch (err) {
            const label = Object.values(v.attributes).join('/') || v.sku;
            errors.push(`[${label}]: ${getErr(err)}`);
          }
        }
        if (errors.length > 0) {
          toast.error(`Product saved but ${errors.length} variant(s) had errors`, { duration: 6000 });
          errors.forEach(e => toast.error(e, { duration: 6000 }));
        } else {
          toast.success(`Product saved with ${variants.length} variants!`);
        }
      } else {
        const autoSku = directInventory.sku.trim()
          || `${slugify(form.name)}-default`.toUpperCase().replace(/-+/g, '-');
        await api.post('/products/variants', {
          id:             directInventory.variantId || null,
          productId:      savedProductId,
          sku:            autoSku,
          price:          parseFloat(form.basePrice) || 0,
          compareAtPrice: (!form.discount && form.compareAtPrice) ? parseFloat(form.compareAtPrice) || null : null,
          stockQuantity:  parseInt(directInventory.stock) || 0,
          attributes:     {},
          isActive:       form.isActive,
          images,
        });
        toast.success(isEdit ? 'Product updated!' : 'Product created!');
      }

      onBack();
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete from editor ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this product and ALL its variants? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      onBack();
    } catch (err) {
      toast.error(getErr(err));
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={26} className="animate-spin text-blue-400" />
    </div>
  );

  const imageOptions = media.filter(m => m.type === 'IMAGE');
  const hasVariants  = variants.length > 0;
  const totalUnits   = variants.reduce((s, v) => s + (parseInt(v.stockQuantity) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/80 pb-24 font-sans">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-none truncate">
              {isEdit ? (form.name || 'Edit Product') : 'New product'}
            </h1>
            {form.slug && <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{form.slug}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status pill */}
          <button
            onClick={() => setF({ isActive: !form.isActive })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              form.isActive
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {form.isActive ? <><CheckCircle size={11} /> Active</> : <><EyeOff size={11} /> Draft</>}
          </button>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 text-white px-5 py-1.5 rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/15 disabled:opacity-60"
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : (isEdit ? 'Update' : 'Save product')}
          </button>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <BasicInfoCard    form={form} setF={setF} handleNameChange={handleNameChange} inp={inp} slugEdited={slugEdited} />
          <MediaGalleryCard media={media} mediaInput={mediaInput} setMediaInput={setMediaInput} addMedia={addMedia} removeMedia={removeMedia} setPrimary={setPrimary} inp={inp} />
          <VariantsCard
            options={options}
            variants={variants}
            form={form}
            bulkPrice={bulkPrice}
            bulkStock={bulkStock}
            setBulkPrice={setBulkPrice}
            setBulkStock={setBulkStock}
            imageOptions={imageOptions}
            hasVariants={hasVariants}
            totalUnits={totalUnits}
            addOption={addOption}
            updateOptionName={updateOptionName}
            addOptionValue={addOptionValue}
            removeOptionValue={removeOptionValue}
            removeOption={removeOption}
            syncVariants={syncVariants}
            updateVariant={updateVariant}
            removeVariant={removeVariant}
            applyBulk={applyBulk}
            inp={inp}
          />
          <SpecsCard specs={specs} setSpecs={setSpecs} updateSpec={updateSpec} inp={inp} />
        </div>

        {/* Right sidebar (1/3) */}
        <div className="space-y-5">
          <StatusCard       form={form} setF={setF} />
          <InventoryCard    options={options} variants={variants} directInventory={directInventory} setDirectInventory={setDirectInventory} form={form} inp={inp} />
          <PricingCard      form={form} setF={setF} hasVariants={hasVariants} inp={inp} />
          <OrganizationCard form={form} setF={setF} flatCats={flatCats} brands={brands} inp={inp} />
          {isEdit && <SummaryCard variants={variants} totalUnits={totalUnits} media={media} specs={specs} form={form} />}
        </div>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-5 py-3 flex items-center justify-between shadow-[0_-1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
          {hasVariants
            ? `${variants.length} variants · ${totalUnits} units total · ${media.length} media`
            : `${parseInt(directInventory.stock) || 0} units · SKU: ${directInventory.sku || 'auto'} · ${media.length} media`}
        </p>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-md shadow-slate-900/15 disabled:opacity-60"
          >
            {saving
              ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
              : (isEdit ? 'Update product' : 'Save product')}
          </button>
        </div>
      </div>
    </div>
  );
}