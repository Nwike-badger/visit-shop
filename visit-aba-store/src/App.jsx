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

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-20 pb-8"> {/* Added pt-20 to push content below fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              
              
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/search" element={<SearchResults />} />
              {/* <Route path="/signup" element={<SignupPage />} /> */}
              
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;