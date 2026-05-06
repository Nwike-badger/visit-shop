import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

/**
 * Fetches active custom categories from the backend.
 *
 * Cache strategy: stores last successful response in localStorage with a 1-hour
 * TTL. On revisit, we render from cache instantly and refresh in the background
 * — same pattern as your product fetches but lighter, since the catalog is small.
 *
 * Used by:
 *   - CustomDesignPage (landing grid)
 *   - CustomDesignerWizard (single-category fetch via useCustomCategory below)
 *
 * Returned shape mirrors what the old static CATEGORIES array exposed —
 * customer code keeps reading `.id`, `.name`, `.gender`, `.sampleStyles`, etc.
 * so the swap from static to API requires minimal page-level changes.
 */

const LIST_CACHE_KEY = 'exploreaba_custom_catalog_v1';
const LIST_TTL_MS = 60 * 60 * 1000; // 1 hour

const readListCache = () => {
  try {
    const raw = localStorage.getItem(LIST_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.data || !cached.savedAt) return null;
    if (Date.now() - cached.savedAt > LIST_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
};

const writeListCache = (data) => {
  try {
    localStorage.setItem(LIST_CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {}
};

/**
 * Maps the API response shape (slug-based) to the legacy frontend shape (id-based)
 * so existing pages can keep using `category.id`, `category.gender`, etc.
 */
const mapCategory = (c) => ({
  id: c.slug,
  slug: c.slug,
  name: c.name,
  tagline: c.tagline,
  description: c.description,
  gender: c.genderHint,
  priceFrom: c.priceFrom != null ? Number(c.priceFrom) : 0,
  leadTime: c.leadTime,
  accent: c.accent || '#0d4d2a',
  coverImageUrl: c.coverImageUrl,
  silhouette: c.silhouettePath,
  measurementSet: c.measurementSet || 'menFull',
  sampleStyles: (c.sampleStyles || []).map(mapStyle),
});

const mapStyle = (s) => ({
  id: s.slug,
  slug: s.slug,
  name: s.name,
  tone: s.tone,
  imageUrl: s.imageUrl,
  description: s.description,
});

// ═════════════════════════════════════════════════════════════════════════
//  Hook for the landing page
// ═════════════════════════════════════════════════════════════════════════

export const useCustomCategories = () => {
  const cached = readListCache();
  const [categories, setCategories] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/v1/custom-catalog/categories');
      const mapped = (res.data || []).map(mapCategory);
      setCategories(mapped);
      writeListCache(mapped);
    } catch (err) {
      console.error('Failed to load custom categories', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, loading, error, refetch: fetch };
};

// ═════════════════════════════════════════════════════════════════════════
//  Hook for the wizard — fetches one category WITH its styles
// ═════════════════════════════════════════════════════════════════════════

export const useCustomCategory = (slug) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/v1/custom-catalog/categories/${slug}`);
        if (!cancelled) setCategory(mapCategory(res.data));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load category', err);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [slug]);

  return { category, loading, error };
};

/** Helper exposed for callers that already have a categories array in hand. */
export const getCategoryById = (categories, id) => categories?.find((c) => c.id === id);