import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductPage from "./pages/product/ProductPage"; 
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import AccountPage from "./pages/account/AccountPage";
import SearchResults from "./pages/SearchResults";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import OrdersPage from "./pages/account/OrdersPage";
import { GoogleOAuthProvider } from '@react-oauth/google';
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
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} /> 
              
              <Navbar />
              
              <main className="pt-4 pb-12">
                <Routes>
                  {/* --- PUBLIC ROUTES --- */}
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
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
                  {/* MUST be logged in AND have ROLE_ADMIN */}
                  <Route element={<ProtectedRoute requireAdmin={true} />}>
                      {/* The AdminLayout wraps all routes inside it */}
                      <Route element={<AdminLayout />}>
                          <Route path="/admin/products" element={<AdminProducts />} />
                          <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                      </Route>
                  </Route>

                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;