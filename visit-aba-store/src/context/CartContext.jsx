import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load Cart from Backend (Handles User or Guest automatically)
  const fetchCart = async () => {
    try {
      const res = await api.get("/v1/cart");
      setCart(res.data);
    } catch (err) {
      // 404 is fine (new user), other errors we log
      if (err.response && err.response.status !== 404) {
        console.error("Failed to load cart", err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (variantId, quantity) => {
    setLoading(true);
    try {
      const res = await api.post("/v1/cart/add", {
        variantId,
        quantity
      });
      setCart(res.data); // Update state with backend's calculation
      return true;
    } catch (err) {
      console.error("Add failed", err);
      const msg = err.response?.data?.message || "Could not add item";
      alert(msg); // Simple alert for now, toast is better
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

  // Called manually after Login to refresh state
  const refreshCart = () => {
    fetchCart();
  };

  const cartItems = cart?.items || [];
  // Use backend's total calculation (Secure)
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