import { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";

const useProducts = (page = 0, size = 20) => {
  const [products, setProducts] = useState([]);
  // Capture Spring Boot's pagination metadata
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
    setError(null); // clear any previous failure so a successful retry actually shows products
    try {
      // Pass the pagination parameters to your Spring Boot backend
      const res = await api.get(`/products?page=${page}&size=${size}`);
      if (res.data && res.data.content) {
        setProducts(res.data.content);
        setPageInfo({
          number: res.data.number,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
          first: res.data.first,
          last: res.data.last
        });
      } else {
        // Fallback just in case an endpoint returns a flat array
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

  // While in an error state, retry automatically once the browser is back online
  useEffect(() => {
    if (!error) return;
    const retry = () => fetchProducts();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [error, fetchProducts]);

  return { products, pageInfo, loading, error, refetch: fetchProducts };
};

export default useProducts;