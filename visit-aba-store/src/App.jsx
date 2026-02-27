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

function App() {
  return (
    <AuthProvider> 
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* 🔥 Add Toaster for beautiful alerts */}
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} /> 
            <Navbar />
            <main className="pt-4 pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              
              
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;