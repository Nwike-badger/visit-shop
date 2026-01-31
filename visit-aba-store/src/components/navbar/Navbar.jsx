import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, User, HelpCircle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryMenu from '../navbar/CategoryMenu';

const Navbar = () => {
  const { cartCount } = useCart();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // 1. Integration: Fetch Categories from Backend
  const { categories, loading } = useCategories();

  // 2. Integration: Search Logic
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirects to: /search?q=laptop
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 shrink-0">Visit Aba</Link>

        {/* Categories & Search (Center) */}
        <div className="flex-grow flex items-center gap-4 max-w-3xl">
          
          {/* Integrated Category Dropdown */}
          <div className="hidden lg:block z-50">
            {loading ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : (
              <CategoryMenu categories={categories} />
            )}
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-grow">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, Brands , Categories..." 
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
               <Search size={18} />
            </button>
          </form>
        </div>

        {/* Right Actions (Unchanged mostly) */}
        <div className="flex items-center gap-6">
          <Link to="/support" className="hidden md:flex items-center gap-1 text-sm font-medium hover:text-blue-600">
            <HelpCircle size={20} /> Support
          </Link>

          {/* Account Dropdown */}
          <div className="relative z-50" onMouseEnter={() => setIsAccountOpen(true)} onMouseLeave={() => setIsAccountOpen(false)}>
            <button className="flex items-center gap-2 hover:text-blue-600 py-2">
              <User size={20} /> <span className="text-sm font-medium">Account</span>
            </button>
            {isAccountOpen && (
              <div className="absolute right-0 top-full w-48 bg-white border shadow-xl rounded-lg py-2 flex flex-col">
                <Link to="/login" className="px-4 py-2 hover:bg-gray-50 text-sm">Log In</Link>
                <Link to="/signup" className="px-4 py-2 hover:bg-gray-50 text-sm font-bold text-blue-600">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;