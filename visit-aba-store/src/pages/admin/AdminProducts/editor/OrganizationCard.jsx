import React, { useState } from 'react';
import { Tag, Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardBody, Field } from '../SharedUI';
import { slugify, getErr } from '../utils';
import api from '../../../../api/axiosConfig';
import { toast } from 'react-hot-toast';

export default function OrganizationCard({ form, setF, flatCats, brands, inp }) {
  const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // ── Local State for newly created items (so we don't have to refetch the whole app)
  const [localCats, setLocalCats] = useState(flatCats || []);
  const [localBrands, setLocalBrands] = useState(brands || []);

  // ── Modal States ──
  const [showCatModal, setShowCatModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form States for New Items ──
  const [newCat, setNewCat] = useState({ name: '', slug: '', parentSlug: '', imageUrl: '', description: '' });
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '' });

  // ── Handlers ──
  const handleCatNameChange = (val) => setNewCat({ ...newCat, name: val, slug: slugify(val) });
  const handleBrandNameChange = (val) => setNewBrand({ ...newBrand, name: val, slug: slugify(val) });

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return toast.error('Category name is required');
    
    setIsSubmitting(true);
    try {
      // Calls your CategoryController POST /api/categories
      const res = await api.post('/categories', {
        name: newCat.name.trim(),
        slug: newCat.slug.trim(),
        parentSlug: newCat.parentSlug || null,
        description: newCat.description.trim() || null,
        imageUrl: newCat.imageUrl.trim() || null
      });

      const created = res.data;
      
      // Update local dropdown list
      const newOption = { 
        value: created.slug, 
        label: newCat.parentSlug ? `— ${created.name}` : created.name 
      };
      setLocalCats([...localCats, newOption]);
      
      // Auto-select it for the product!
      setF({ categorySlug: created.slug });
      
      toast.success('Category created!');
      setShowCatModal(false);
      setNewCat({ name: '', slug: '', parentSlug: '', imageUrl: '', description: '' });
    } catch (err) {
      toast.error(getErr(err) || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.name.trim()) return toast.error('Brand name is required');
    
    setIsSubmitting(true);
    try {
      // Calls your BrandController POST (Assuming you have this endpoint)
      const res = await api.post('/brands', {
        name: newBrand.name.trim(),
        slug: newBrand.slug.trim(),
        description: newBrand.description.trim() || null
      });

      const created = res.data;
      
      setLocalBrands([...localBrands, created]);
      setF({ brandSlug: created.slug }); // Auto-select
      
      toast.success('Brand created!');
      setShowBrandModal(false);
      setNewBrand({ name: '', slug: '', description: '' });
    } catch (err) {
      toast.error(getErr(err) || 'Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>Organisation</CardHeader>
        <CardBody className="space-y-5">
          
          {/* ── CATEGORY FIELD ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <button 
                type="button"
                onClick={() => setShowCatModal(true)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Create new
              </button>
            </div>
            <select
              value={form.categorySlug}
              onChange={e => setF({ categorySlug: e.target.value })}
              className={inp}
            >
              <option value="">No category selected</option>
              {localCats.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* ── BRAND FIELD ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Brand</label>
              <button 
                type="button"
                onClick={() => setShowBrandModal(true)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Create new
              </button>
            </div>
            <select
              value={form.brandSlug}
              onChange={e => setF({ brandSlug: e.target.value })}
              className={inp}
            >
              <option value="">No brand selected</option>
              {localBrands.map(b => (
                <option key={b.slug || b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>

          <Field label="Campaign Tags" hint="Comma-separated. Used by the campaign engine for promotions.">
            <input
              value={form.tags}
              onChange={e => setF({ tags: e.target.value })}
              className={inp}
              placeholder="flash-sale, electronics, new-arrival"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-lg"
                  >
                    <Tag size={9} /> {t}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </CardBody>
      </Card>

      {/* ── INLINE CATEGORY MODAL ── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Create New Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-5 space-y-4">
              <Field label="Category Name" required>
                <input required value={newCat.name} onChange={e => handleCatNameChange(e.target.value)} className={inp} placeholder="e.g. Outerwear" autoFocus />
              </Field>
              
              <Field label="Parent Category" hint="Leave blank to create a root category">
                <select value={newCat.parentSlug} onChange={e => setNewCat({...newCat, parentSlug: e.target.value})} className={inp}>
                  <option value="">None (Root Category)</option>
                  {localCats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>

              <Field label="Image URL">
                <div className="relative">
                  <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={newCat.imageUrl} onChange={e => setNewCat({...newCat, imageUrl: e.target.value})} className={`${inp} pl-9`} placeholder="https://..." />
                </div>
              </Field>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md disabled:opacity-60 flex items-center gap-2 transition-colors">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INLINE BRAND MODAL ── */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Create New Brand</h3>
              <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateBrand} className="p-5 space-y-4">
              <Field label="Brand Name" required>
                <input required value={newBrand.name} onChange={e => handleBrandNameChange(e.target.value)} className={inp} placeholder="e.g. Nike" autoFocus />
              </Field>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowBrandModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md disabled:opacity-60 flex items-center gap-2 transition-colors">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}