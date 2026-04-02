import React, { useState, useCallback, useMemo, useEffect } from 'react';
import api from '../../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  FolderTree, Plus, Pencil, Trash2, ChevronRight, ChevronDown,
  Loader2, X, Image as ImageIcon, FolderOpen, Folder,
  Search, RefreshCw, AlertTriangle, ArrowLeft, Hash,
  CornerDownRight, Layers, ShieldAlert, CheckCircle2,
} from 'lucide-react';
import { getErr } from '../utils';
import { Card, CardHeader, CardBody, Field } from '../SharedUI';

/* ─────────────────────────────────────────────────────────────────
   Utilities
───────────────────────────────────────────────────────────────── */
const slugify = (s = '') =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Flatten tree preserving depth + excluding a slug (to prevent
 * self-parenting or circular references).
 */
const flattenForSelect = (nodes, depth = 0, excludeSlug = null) => {
  const result = [];
  for (const n of nodes) {
    if (n.slug === excludeSlug) continue;
    result.push({ ...n, depth });
    if (n.children?.length)
      result.push(...flattenForSelect(n.children, depth + 1, excludeSlug));
  }
  return result;
};

/** Recursively count all descendants */
const countDescendants = (node) =>
  (node.children || []).reduce((sum, c) => sum + 1 + countDescendants(c), 0);

/** Filter tree nodes matching query, keeping ancestors visible */
const filterTree = (nodes, q) => {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes.reduce((acc, node) => {
    const children = filterTree(node.children || [], q);
    if (
      node.name.toLowerCase().includes(lower) ||
      node.slug.toLowerCase().includes(lower) ||
      children.length
    ) {
      acc.push({ ...node, children });
    }
    return acc;
  }, []);
};

/** Aggregate stats from tree */
const computeStats = (nodes, depth = 0) => {
  let total = nodes.length, subs = 0, maxDepth = depth;
  for (const n of nodes) {
    if (depth > 0) subs++;
    const child = computeStats(n.children || [], depth + 1);
    total    += child.total;
    subs     += child.subs;
    maxDepth  = Math.max(maxDepth, child.maxDepth);
  }
  return { total, subs, maxDepth };
};

/** Find the parent node of a given slug */
const findParentNode = (nodes, targetSlug, parent = null) => {
  for (const n of nodes) {
    if (n.slug === targetSlug) return parent;
    const found = findParentNode(n.children || [], targetSlug, n);
    if (found !== undefined) return found;
  }
  return undefined;
};

/* ─────────────────────────────────────────────────────────────────
   Depth colour palette
───────────────────────────────────────────────────────────────── */
const DEPTH_PALETTE = [
  { folder: 'text-blue-500',   badge: 'bg-blue-50 text-blue-600 border-blue-200'   },
  { folder: 'text-violet-500', badge: 'bg-violet-50 text-violet-600 border-violet-200' },
  { folder: 'text-emerald-500',badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { folder: 'text-amber-500',  badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  { folder: 'text-rose-500',   badge: 'bg-rose-50 text-rose-600 border-rose-200'   },
];
const dp = (d) => DEPTH_PALETTE[d % DEPTH_PALETTE.length];

/* ─────────────────────────────────────────────────────────────────
   TreeNode
───────────────────────────────────────────────────────────────── */
function TreeNode({ node, depth, expanded, toggleExpand, onEdit, onAddChild, onDelete }) {
  const hasChildren = (node.children || []).length > 0;
  const isExpanded  = expanded.has(node.id);
  const color       = dp(depth);
  const isLeaf      = !hasChildren;

  return (
    <div className="select-none">
      <div
        className={`
          group relative flex items-center gap-2 px-3 py-2.5 rounded-xl
          hover:bg-slate-50/80 transition-colors
        `}
      >
        {/* ── Expand / leaf indicator ── */}
        <button
          onClick={() => hasChildren && toggleExpand(node.id)}
          className={`
            w-5 h-5 flex items-center justify-center rounded-md shrink-0 transition-colors
            ${hasChildren ? 'hover:bg-slate-200 text-slate-500 cursor-pointer' : 'cursor-default'}
          `}
        >
          {hasChildren
            ? (isExpanded
                ? <ChevronDown size={13} className="text-slate-500" />
                : <ChevronRight size={13} className="text-slate-400" />)
            : <span className="w-1.5 h-1.5 rounded-full bg-slate-200 block" />}
        </button>

        {/* ── Folder icon ── */}
        {(hasChildren && isExpanded)
          ? <FolderOpen size={15} className={`${color.folder} shrink-0`} />
          : <Folder     size={15} className={`${color.folder} shrink-0 ${isLeaf ? 'opacity-60' : ''}`} />}

        {/* ── Category image (if set) ── */}
        {node.imageUrl && (
          <img
            src={node.imageUrl}
            alt=""
            className="w-6 h-6 rounded-lg object-cover border border-slate-200 shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}

        {/* ── Name ── */}
        <span className="text-sm font-semibold text-slate-800 flex-1 truncate leading-none">
          {node.name}
        </span>

        {/* ── Slug chip ── */}
        <span className="text-[10px] text-slate-400 font-mono hidden md:inline shrink-0 max-w-[140px] truncate">
          /{node.slug}
        </span>

        {/* ── Children count badge ── */}
        {hasChildren && (
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${color.badge}`}>
            {node.children.length}
          </span>
        )}

        {/* ── Action buttons (appear on row hover) ── */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          {/* Add child */}
          <button
            type="button"
            onClick={() => onAddChild(node)}
            title="Add child category"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus size={13} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(node)}
            title="Edit category"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Pencil size={13} />
          </button>

          {/* Delete — disabled (with tooltip) when category has children */}
          <button
            type="button"
            onClick={() => onDelete(node)}
            title={hasChildren
              ? `Cannot delete: "${node.name}" has ${node.children.length} child categor${node.children.length > 1 ? 'ies' : 'y'}. Delete or reassign children first.`
              : 'Delete category'}
            className={`p-1.5 rounded-lg transition-colors ${
              hasChildren
                ? 'text-slate-200 cursor-not-allowed'
                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Children with visual connector ── */}
      {hasChildren && isExpanded && (
        <div className="relative ml-[22px] pl-4 border-l-2 border-slate-100">
          {node.children.map((child, idx) => (
            <div key={child.id} className="relative">
              {/* Horizontal connector tick */}
              <div className="absolute -left-4 top-[21px] w-4 h-px bg-slate-200" />
              <TreeNode
                node={child}
                depth={depth + 1}
                expanded={expanded}
                toggleExpand={toggleExpand}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Category Form Modal (Create + Edit)
───────────────────────────────────────────────────────────────── */
function CategoryFormModal({ mode, initialData, allCategories, onSave, onClose, saving }) {
  const isEdit = mode === 'edit';
  const INP    = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300';

  const [form, setForm] = useState({
    name:        initialData?.name        || '',
    slug:        initialData?.slug        || '',
    parentSlug:  initialData?.parentSlug  || '',
    imageUrl:    initialData?.imageUrl    || '',
    description: initialData?.description || '',
  });
  const [slugManual, setSlugManual] = useState(isEdit);

  const setF = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleNameChange = (val) => {
    setF({ name: val, ...(!slugManual ? { slug: slugify(val) } : {}) });
  };

  /* Flat list excluding self (prevent circular parenting) */
  const flatOptions = useMemo(
    () => flattenForSelect(allCategories, 0, isEdit ? initialData?.slug : null),
    [allCategories, isEdit, initialData]
  );

  const canSubmit = form.name.trim() && form.slug.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
              <FolderTree size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-none">
                {isEdit
                  ? `Edit "${initialData?.name}"`
                  : initialData?.parentName
                    ? `New sub-category under "${initialData.parentName}"`
                    : 'New Root Category'}
              </h3>
              {isEdit && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  /{initialData?.slug}
                </p>
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

          {/* Parent breadcrumb (informational) */}
          {(form.parentSlug || initialData?.parentName) && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <CornerDownRight size={11} className="text-slate-400" />
              <span className="text-slate-400">Will be nested under</span>
              <span className="font-bold text-slate-600">
                {flatOptions.find(c => c.slug === form.parentSlug)?.name || initialData?.parentName || '—'}
              </span>
            </div>
          )}

          {/* Name */}
          <Field label="Category Name" required>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              className={INP}
              placeholder="e.g. Men's Outerwear"
              autoFocus
            />
          </Field>

          {/* Slug */}
          <Field
            label="URL Slug"
            hint={isEdit
              ? '⚠ Changing the slug may break existing links and cached references.'
              : 'Auto-generated from name — click to customise.'}
          >
            <div className="relative">
              <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.slug}
                onChange={e => { setSlugManual(true); setF({ slug: slugify(e.target.value) }); }}
                className={`${INP} pl-8 font-mono text-[13px]`}
                placeholder="mens-outerwear"
              />
            </div>
            {form.slug && (
              <p className="text-[10px] text-slate-400 mt-1">
                Path: <span className="text-slate-600 font-mono">/categories/{form.slug}</span>
              </p>
            )}
          </Field>

          {/* Parent category */}
          <Field
            label="Parent Category"
            hint="Change to nest under a different parent, or clear to make this a root category."
          >
            <select
              value={form.parentSlug}
              onChange={e => setF({ parentSlug: e.target.value })}
              className={INP}
            >
              <option value="">— None (Root / Top-level)</option>
              {flatOptions.map(c => (
                <option key={c.slug} value={c.slug}>
                  {'  '.repeat(c.depth)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Image URL */}
          <Field label="Image URL" hint="Category thumbnail or banner. Accepts any public image URL.">
            <div className="flex gap-2 items-start">
              <div className="relative flex-1">
                <ImageIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.imageUrl}
                  onChange={e => setF({ imageUrl: e.target.value })}
                  className={`${INP} pl-8`}
                  placeholder="https://…"
                />
              </div>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </Field>

          {/* Description */}
          <Field label="Description" hint="Optional. Shown on category pages and used for SEO.">
            <textarea
              value={form.description}
              onChange={e => setF({ description: e.target.value })}
              className={`${INP} resize-none h-[72px]`}
              placeholder="Short description of this category…"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-[10px] text-slate-400">
            {isEdit ? 'Saving updates the category tree immediately.' : 'New category will appear in the tree instantly.'}
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
              {saving
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCircle2 size={14} />}
              {isEdit ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Delete Confirmation Dialog
───────────────────────────────────────────────────────────────── */
function DeleteDialog({ category, onConfirm, onClose, deleting }) {
  const hasChildren    = (category.children || []).length > 0;
  const childCount     = category.children?.length || 0;
  const descendantCount = countDescendants(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Warning / Error header */}
        <div className={`px-6 py-5 flex items-start gap-4 ${hasChildren ? 'bg-amber-50 border-b border-amber-100' : 'bg-red-50 border-b border-red-100'}`}>
          {hasChildren
            ? <ShieldAlert size={22} className="text-amber-500 shrink-0 mt-0.5" />
            : <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />}
          <div>
            <h3 className="font-bold text-slate-900">
              {hasChildren ? 'Cannot delete this category' : 'Delete this category?'}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {hasChildren ? (
                <>
                  <strong>"{category.name}"</strong> has{' '}
                  <strong>{childCount} direct child{childCount > 1 ? 'ren' : ''}</strong>
                  {descendantCount > childCount && ` (${descendantCount} total sub-categories)`}.
                  <br />
                  Delete or reassign all nested categories first, then come back to delete this one.
                </>
              ) : (
                <>
                  <strong>"{category.name}"</strong> will be permanently removed from your
                  category tree. This action cannot be undone.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {hasChildren ? 'Got it' : 'Cancel'}
          </button>
          {!hasChildren && (
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
   CategoryManager — main export
───────────────────────────────────────────────────────────────── */
export default function CategoryManager({ onBack }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [expanded,   setExpanded]   = useState(new Set());

  const [modal,        setModal]        = useState(null);   // { mode, initialData }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  /* ── Fetch tree from backend ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/tree');
      const data = res.data || [];
      setCategories(data);
      // Auto-expand root level
      setExpanded(new Set(data.map(c => c.id)));
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const { total, subs, maxDepth } = computeStats(categories);
    return [
      {
        label: 'Total categories',
        val: total,
        color: 'text-slate-800',
        bg: 'bg-white border-slate-200',
      },
      {
        label: 'Root categories',
        val: categories.length,
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-200',
      },
      {
        label: 'Sub-categories',
        val: subs,
        color: 'text-violet-700',
        bg: 'bg-violet-50 border-violet-200',
      },
      {
        label: 'Max depth',
        val: maxDepth,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
      },
    ];
  }, [categories]);

  /* ── Tree expand/collapse ── */
  const toggleExpand = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const ids = new Set();
    const collect = (nodes) => nodes.forEach(n => { ids.add(n.id); collect(n.children || []); });
    collect(categories);
    setExpanded(ids);
  };

  const collapseAll = () => setExpanded(new Set());

  /* ── Open create modal ── */
  const openCreate = (parentNode = null) => {
    setModal({
      mode: 'create',
      initialData: {
        parentSlug: parentNode?.slug || '',
        parentName: parentNode?.name || '',
      },
    });
  };

  /* ── Open edit modal ── */
  const openEdit = (node) => {
    const parent = findParentNode(categories, node.slug);
    setModal({
      mode: 'edit',
      initialData: {
        id:          node.id,
        name:        node.name,
        slug:        node.slug,
        imageUrl:    node.imageUrl || '',
        description: node.description || '',
        parentSlug:  parent?.slug || '',
        parentName:  parent?.name || '',
      },
    });
  };

  /* ── Save (create or update) ── */
  const handleSave = async (form) => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        slug:        form.slug.trim(),
        parentSlug:  form.parentSlug || null,
        description: form.description.trim() || null,
        imageUrl:    form.imageUrl.trim() || null,
      };

      if (modal.mode === 'create') {
        await api.post('/categories', payload);
        toast.success(`"${form.name}" created!`);
      } else {
        // Passing empty string parentSlug means "make root"
        await api.put(`/categories/${modal.initialData.slug}`, {
          ...payload,
          // Backend interprets empty-string vs null differently for root promotion
          parentSlug: form.parentSlug === '' ? null : form.parentSlug,
        });
        toast.success(`"${form.name}" updated!`);
      }

      setModal(null);
      await fetchCategories();
    } catch (err) {
      toast.error(getErr(err) || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.slug}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      toast.error(getErr(err) || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Filtered display tree ── */
  const displayTree = useMemo(() => filterTree(categories, search), [categories, search]);

  return (
    <div className="min-h-screen bg-slate-50/80 pb-16 font-sans">

      {/* ── Sticky header ── */}
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
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30">
            <FolderTree size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Categories</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage your product taxonomy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            title="Refresh"
            className="p-2 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => openCreate()}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/15"
          >
            <Plus size={14} /> Add root category
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl px-4 py-3.5 border ${s.bg}`}>
              <p className={`text-2xl font-black leading-none ${s.color}`}>{s.val}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + tree controls ── */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories by name or slug…"
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all placeholder:text-slate-300"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Collapse
          </button>
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Plus size={10} className="text-blue-500" /> Add child
          </span>
          <span className="flex items-center gap-1.5">
            <Pencil size={10} /> Edit
          </span>
          <span className="flex items-center gap-1.5">
            <Trash2 size={10} className="text-slate-300" /> Delete (disabled if has children)
          </span>
          <span className="ml-auto">Hover a row to see actions</span>
        </div>

        {/* ── Category tree ── */}
        <Card>
          <CardHeader
            subtitle={
              search
                ? `Showing results for "${search}"`
                : `${categories.length} root ${categories.length === 1 ? 'category' : 'categories'}`
            }
            action={
              <button
                onClick={() => openCreate()}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add root
              </button>
            }
          >
            Category Tree
          </CardHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <p className="text-xs text-slate-400 font-medium">Loading category tree…</p>
            </div>
          ) : displayTree.length === 0 ? (
            <div className="py-20 text-center">
              <Layers size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-semibold text-sm">
                {search ? `No categories match "${search}"` : 'No categories yet'}
              </p>
              {!search && (
                <button
                  onClick={() => openCreate()}
                  className="mt-5 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-md"
                >
                  Create your first category
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 space-y-0.5">
              {displayTree.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  onEdit={openEdit}
                  onAddChild={openCreate}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </Card>

       

      </div>

      {/* ── Modals ── */}
      {modal && (
        <CategoryFormModal
          mode={modal.mode}
          initialData={modal.initialData}
          allCategories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          category={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}