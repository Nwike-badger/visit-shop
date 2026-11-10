import { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";

const useProducts = (page = 0, size = 20) => {
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products?page=${page}&size=${size}`);
      if (res.data && res.data.content) {
        const meta = res.data.page || res.data; // supports both new nested and old flat shape
        setProducts(res.data.content);
        setPageInfo({
          number: meta.number,
          totalPages: meta.totalPages,
          totalElements: meta.totalElements,
          first: meta.number === 0,
          last: meta.number >= meta.totalPages - 1
        });
      } else {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load products");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!error) return;
    const retry = () => fetchProducts();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [error, fetchProducts]);

  return { products, pageInfo, loading, error, refetch: fetchProducts };
};

export default useProducts;