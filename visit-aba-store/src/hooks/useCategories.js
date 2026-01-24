import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Calls your backend: CategoryController.getTree()
        const response = await api.get('/categories/tree');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};