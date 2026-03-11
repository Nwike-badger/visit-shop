import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        
        // 🔥 THE ENTERPRISE FIX: 
        // If it's a Spring Boot Page object, grab .content. Otherwise, use the raw data.
        const productArray = res.data.content ? res.data.content : res.data;
        
        setProducts(productArray);
      } catch (err) {
        console.error(err);
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

export default useProducts;