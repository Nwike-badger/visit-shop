import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await api.get("/v1/cart");
      setCart(res.data);
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        console.error("Failed to load cart", err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔥 SEND THE ATTRIBUTES TO THE BACKEND
  const addToCart = async (variantId, quantity, variantAttributes = {}) => {
    setLoading(true);
    try {
      const res = await api.post("/v1/cart/add", {
        variantId,
        quantity,
        variantAttributes // Passes the exact Size/Color to Spring Boot
      });
      setCart(res.data); 
      return true;
    } catch (err) {
      console.error("Add failed", err);
      const msg = err.response?.data?.message || "Could not add item";
      alert(msg); 
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (variantId) => {
    try {
      const res = await api.delete(`/v1/cart/remove/${variantId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/v1/cart/clear");
      setCart(null);
    } catch (err) {
      console.error("Clear failed", err);
    }
  };

  const refreshCart = () => {
    fetchCart();
  };

  const cartItems = cart?.items || [];
  const cartTotal = cart?.totalAmount || 0; 
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartCount, 
      cartTotal, 
      loading,
      refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);