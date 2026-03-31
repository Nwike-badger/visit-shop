// ─── usePersonalizedFeed.js ──────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { getSessionId } from '../utils/session';

export const usePersonalizedFeed = ({ categorySlug, limit = 10 } = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    const params = new URLSearchParams({ limit });

    if (categorySlug) {
      params.set('categorySlug', categorySlug);
    }

    setLoading(true);

    api.get(`/v1/recommendations/for-you?${params}`, {
      headers: { 'X-Session-Id': sessionId },
    })
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

  }, [categorySlug, limit]);

  return { products, loading };
};