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
        const response = await api.get(`/products/${id}`);
        
        // ✅ DATA TRANSFORMATION
        // Backend sends: { product: {...}, variants: [...] }
        // We flatten it for the UI
        console.log("RAW API RESPONSE:", response.data);
        const { product: productData, variants } = response.data;
        
        setProduct({
            ...productData,
            variants: variants // Attach variants to the main object
        });
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