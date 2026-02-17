import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductPage from "./pages/product/ProductPage"; // 👈 IMPORT THIS

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
              
              {/* 🔥 THIS WAS MISSING: */}
              <Route path="/product/:id" element={<ProductPage />} />
              
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;