// ─── useSmartSearch.js ────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';
import { getSessionId } from '../utils/session';

export const useSmartSearch = ({ query, categorySlug, minPrice, maxPrice, pageSize = 24 }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const abortRef = useRef(null);
  const sessionId = getSessionId();

  const fetchResults = useCallback(async (currentQuery, currentPage) => {
    if (!currentQuery || !currentQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: currentQuery.trim(),
        page: currentPage,
        size: pageSize,
      });

      if (categorySlug) params.set('category', categorySlug);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await api.get(`/v1/search?${params}`, {
        signal: abortRef.current.signal,
        headers: { 'X-Session-Id': sessionId },
      });

      setResults(res.data.content || res.data);
      setTotal(res.data.totalElements || (res.data.content?.length ?? 0));

      api.post('/v1/track/search', { query: currentQuery }, {
        headers: { 'X-Session-Id': sessionId },
      }).catch(() => {});

    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, minPrice, maxPrice, pageSize, sessionId]);

  useEffect(() => {
    setPage(0);
    const timer = setTimeout(() => fetchResults(query, 0), 350);
    return () => clearTimeout(timer);
  }, [query, categorySlug, minPrice, maxPrice]);

  useEffect(() => {
    if (page > 0) fetchResults(query, page);
  }, [page]);

  const trackResultClick = useCallback((productId) => {
    api.post('/track/search', { query, productId }, {
      headers: { 'X-Session-Id': sessionId },
    }).catch(() => {});
  }, [query, sessionId]);

  return { results, loading, error, total, page, setPage, trackResultClick };
};