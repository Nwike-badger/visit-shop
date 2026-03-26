import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

let cachedCategories = null;
let fetchPromise = null;

export const useCategories = () => {
  const [categories, setCategories] = useState(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Already have data — skip the network entirely
    if (cachedCategories) return;

    const fetchCategories = async () => {
      try {
        // Deduplicate in-flight requests
        if (!fetchPromise) {
          fetchPromise = api.get('/categories/tree');
        }

        const response = await fetchPromise;
        const data = response.data;

        // 🔥 THE SHIELD: Validate before caching!
        if (Array.isArray(data)) {
          cachedCategories = data;
        } else if (data && Array.isArray(data.content)) {
          cachedCategories = data.content; 
        } else if (data && Array.isArray(data.data)) {
          cachedCategories = data.data; 
        } else if (typeof data === 'string' && data.includes('ngrok')) {
          console.error("🚨 NGROK BLOCKED THE TREE REQUEST. Check your bypass headers.");
          cachedCategories = [];
          // Force the promise to reset so the app can try again later
          fetchPromise = null; 
        } else {
          console.error("🚨 API returned invalid data:", data);
          cachedCategories = [];
        }

        setCategories(cachedCategories);
      } catch (err) {
        fetchPromise = null;
        cachedCategories = null;
        console.error('Failed to fetch categories', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};