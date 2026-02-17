import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        // This fetches ONE product by ID
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};

export default useProduct;