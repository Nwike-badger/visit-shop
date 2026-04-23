import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  Settings2, ChevronUp, ChevronDown, Eye, EyeOff,
  Image as ImageIcon, RotateCcw, Save, Loader2, X,
  ArrowUpToLine, CheckCircle2, Layers,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../SharedUI';
import { CAT_BAR_CONFIG_KEY, defaultCatBarConfig, loadCatBarConfig } from '../../../../components/CategoryBar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const persistConfig = (cfg) => {
  localStorage.setItem(CAT_BAR_CONFIG_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event('cat_bar_config_updated'));
};

const flattenAll = (nodes, depth = 0, result = []) => {
  for (const n of nodes) {
    result.push({ slug: n.slug, name: n.name, depth });
    if (n.children?.length) flattenAll(n.children, depth + 1, result);
  }
  return result;
};

const findNode = (nodes, slug) => {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    if (n.children?.length) {
      const f = findNode(n.children, slug);
      if (f) return f;
    }
  }
  return null;
};

// ─── ImagePickerModal ─────────────────────────────────────────────────────────
function ImagePickerModal({ slug, currentUrl, onPick, onClose }) {
  const [url, setUrl]           = useState(currentUrl || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?categorySlug=${slug}&page=0&size=12`);
        setProducts(res.data?.content ?? res.data ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const productImages = useMemo(() => {
    const seen = new Set();
    const imgs = [];
    for (const p of products) {
      for (const img of (p.images || [])) {
        if (img?.url && !seen.has(img.url)) {
          seen.add(img.url);
          imgs.push({ url: img.url, productName: p.name });
        }
      }
    }
    return imgs.slice(0, 12);
  }, [products]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Override image</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{slug}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Image URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              {url && (
                <img
                  src={url}
                  alt="preview"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pick from products in this category
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 size={13} className="animate-spin" /> Loading product images…
              </div>
            ) : productImages.length === 0 ? (
              <p className="text-xs text-slate-400">No products found in this category.</p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setUrl(img.url)}
                    title={img.productName}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      url === img.url ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={() => { setUrl(''); onPick(''); }}
            className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            Remove override
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onPick(url); onClose(); }}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 size={13} /> Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryBarSettings ──────────────────────────────────────────────────────
export default function CategoryBarSettings({ allCategories }) {
  const [config, setConfig]       = useState(loadCatBarConfig);
  const [saving, setSaving]       = useState(false);
  const [loadingServer, setLoadingServer] = useState(true); // ← fetch server config on mount
  const [pickerFor, setPickerFor] = useState(null);

  // ── Fetch authoritative parentSlug from server on mount ──
  // Without this, the admin panel shows a stale localStorage value if
  // another device saved a different config.
  useEffect(() => {
    api.get('/v1/config/cat-bar')
      .then(res => {
        const serverSlug = res.data?.catBarParentSlug ?? null;
        setConfig(prev => ({ ...prev, parentSlug: serverSlug }));
      })
      .catch(() => {
        // Silently fall back to localStorage value already in state
      })
      .finally(() => setLoadingServer(false));
  }, []);

  const flatOptions = useMemo(() => flattenAll(allCategories || []), [allCategories]);

  const poolFromTree = useMemo(() => {
    if (!Array.isArray(allCategories)) return [];
    if (!config.parentSlug) {
      return allCategories.filter(c => !c.parent && !c.parentId && !c.parentSlug);
    }
    const parent = findNode(allCategories, config.parentSlug);
    return parent?.children ?? [];
  }, [allCategories, config.parentSlug]);

  const [items, setItems] = useState([]);

  useEffect(() => {
    const hidden   = new Set(config.hiddenSlugs ?? []);
    const orderMap = new Map((config.order ?? []).map((s, i) => [s, i]));

    const withMeta = poolFromTree.map(cat => ({
      ...cat,
      hidden:   hidden.has(cat.slug),
      orderIdx: orderMap.has(cat.slug) ? orderMap.get(cat.slug) : 9999,
    }));

    withMeta.sort((a, b) => a.orderIdx - b.orderIdx);
    setItems(withMeta);
  }, [poolFromTree, config.order, config.hiddenSlugs]);

  const extractOrder = (arr) => arr.map(it => it.slug);

  const move = (idx, dir) => {
    const next   = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    setConfig(c => ({ ...c, order: extractOrder(next) }));
  };

  const pinFirst = (idx) => {
    const next = [...items];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    setItems(next);
    setConfig(c => ({ ...c, order: extractOrder(next) }));
  };

  const toggleHidden = (slug) => {
    setConfig(c => {
      const set = new Set(c.hiddenSlugs ?? []);
      set.has(slug) ? set.delete(slug) : set.add(slug);
      return { ...c, hiddenSlugs: [...set] };
    });
  };

  const applyImageOverride = (slug, url) => {
    setConfig(c => {
      const overrides = { ...c.imageOverrides };
      if (url) {
        overrides[slug] = url;
      } else {
        delete overrides[slug];
      }
      return { ...c, imageOverrides: overrides };
    });
  };

  const handleParentChange = (slug) => {
    setConfig(c => ({
      ...c,
      parentSlug:  slug || null,
      order:       [],   // reset when changing level
      hiddenSlugs: [],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // parentSlug → backend (device-independent source of truth)
      await api.put('/v1/config/cat-bar', {
        catBarParentSlug: config.parentSlug ?? null,
      });
      // order / hidden / imageOverrides → localStorage (lightweight UI prefs)
      persistConfig(config);
      toast.success('Category bar settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await api.put('/v1/config/cat-bar', { catBarParentSlug: null });
      const fresh = defaultCatBarConfig();
      setConfig(fresh);
      persistConfig(fresh);
      toast.success('Reset to defaults');
    } catch {
      toast.error('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = items.filter(it => !it.hidden).length;

  // Show a subtle loading state while fetching server config
  if (loadingServer) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
            <Loader2 size={14} className="animate-spin" /> Loading settings…
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          subtitle={`${visibleCount} of ${items.length} categories visible in the bar`}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={saving}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={11} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                Save
              </button>
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-blue-500" />
            Category Bar Settings
          </div>
        </CardHeader>

        <CardBody className="space-y-5">

          {/* ── Source level picker ── */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Show children of
            </label>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              Pick the parent whose direct children appear in the bar. Leave blank to show root-level categories.
            </p>
            <select
              value={config.parentSlug ?? ''}
              onChange={e => handleParentChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">— Root categories (top-level only)</option>
              {flatOptions.map(c => (
                <option key={c.slug} value={c.slug}>
                  {'  '.repeat(c.depth)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                </option>
              ))}
            </select>
            {config.parentSlug && (
              <p className="text-[10px] text-blue-500 font-mono mt-1">
                /{config.parentSlug} → showing {items.length} direct children
              </p>
            )}
          </div>

          {/* ── Category list ── */}
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <Layers size={24} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">
                {config.parentSlug ? 'This category has no children.' : 'No root categories found.'}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Order & Visibility
                </label>
                <p className="text-[10px] text-slate-400">Use arrows to reorder</p>
              </div>

              <div className="space-y-1.5">
                {items.map((item, idx) => {
                  const override    = config.imageOverrides?.[item.slug];
                  const effectiveImg = override || item.imageUrl;
                  const isHidden    = item.hidden;

                  return (
                    <div
                      key={item.slug}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
                        isHidden
                          ? 'bg-slate-50 border-slate-100 opacity-50'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Position index */}
                      <span className="text-[10px] font-black text-slate-300 w-4 text-center shrink-0">
                        {isHidden ? '—' : idx - items.filter((it, i) => i < idx && it.hidden).length + 1}
                      </span>

                      {/* Image preview / override trigger */}
                      <button
                        onClick={() => setPickerFor(item.slug)}
                        title="Override image"
                        className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 shrink-0 transition-colors group/img"
                      >
                        {effectiveImg ? (
                          <img
                            src={effectiveImg}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <ImageIcon size={12} className="text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/70 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                          <ImageIcon size={10} className="text-white" />
                        </div>
                        {override && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-white" />
                        )}
                      </button>

                      {/* Name + slug */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isHidden ? 'text-slate-400' : 'text-slate-800'}`}>
                          {item.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">/{item.slug}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {idx > 0 && !isHidden && (
                          <button
                            onClick={() => pinFirst(idx)}
                            title="Pin to first position"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ArrowUpToLine size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => move(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => move(idx, 1)}
                          disabled={idx === items.length - 1}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          onClick={() => toggleHidden(item.slug)}
                          title={isHidden ? 'Show in bar' : 'Hide from bar'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isHidden
                              ? 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                              : 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1"><ArrowUpToLine size={9} /> Pin first</span>
                <span className="flex items-center gap-1"><ChevronUp size={9} /><ChevronDown size={9} /> Reorder</span>
                <span className="flex items-center gap-1"><EyeOff size={9} /> Hide</span>
                <span className="flex items-center gap-1"><ImageIcon size={9} className="text-blue-500" /> Override image (blue dot = set)</span>
              </div>
            </div>
          )}

          {/* ── Save bar ── */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              Parent level saved to server · Order & visibility saved locally.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save settings
            </button>
          </div>

        </CardBody>
      </Card>

      {pickerFor && (
        <ImagePickerModal
          slug={pickerFor}
          currentUrl={config.imageOverrides?.[pickerFor] ?? ''}
          onPick={(url) => applyImageOverride(pickerFor, url)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </>
  );
}