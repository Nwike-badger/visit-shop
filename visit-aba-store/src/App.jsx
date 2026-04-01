import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext"; // 👈 NEW: Import Provider
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog"; 
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist"; // 👈 NEW: Import Wishlist Page
import ProductPage from "./pages/product/ProductPage"; 
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import AccountPage from "./pages/account/AccountPage";
import SearchResults from "./pages/SearchResults";
import OrdersPage from "./pages/account/OrdersPage";
import OrderDetailPage from "./pages/account/OrderDetailPage";
import PaymentCallback from "./pages/PaymentCallback";

// --- ROUTE PROTECTION & LAYOUTS ---
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// --- ADMIN PAGES ---
import AdminProducts from "./pages/admin/AdminProducts/Index";
import AdminCampaigns from "./pages/admin/AdminCampaigns";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider> 
        <CartProvider>
          {/* 👈 NEW: Wrap with WishlistProvider */}
          <WishlistProvider> 
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} /> 
                
                <Navbar />
                
                <main className="pt-4 pb-12">
                  <Routes>
                    {/* --- PUBLIC ROUTES --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Catalog />} /> 
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} /> {/* 👈 NEW: Wishlist Route */}
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/payment/callback" element={<PaymentCallback />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/orders/:orderNumber"  element={<OrderDetailPage />} /> 
                    </Route>

                    {/* --- PROTECTED ADMIN ROUTES --- */}
                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/products" element={<AdminProducts />} />
                            <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                        </Route>
                    </Route>
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;