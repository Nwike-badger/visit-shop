import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X,
  HelpCircle 
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryMenu from '../navbar/CategoryMenu';

const Navbar = () => {
  const { cartCount } = useCart();
  const { categories, loading } = useCategories();
  const navigate = useNavigate();

  // State
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Top Banner - Very modern for e-commerce (optional) */}
      <div className="bg-blue-600 text-white text-[11px] font-bold text-center py-1.5 tracking-wide ">
        FREE SHIPPING ON ORDERS OVER ₦50,000
      </div>

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 md:gap-8 py-3">
          
          {/* 1. Left Section: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger (Visible only on mobile) */}
            <button 
              className="lg:hidden p-1 text-gray-600 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-600 shrink-0">
              Visit<span className="text-gray-900">Aba</span>
            </Link>
          </div>

          {/* 2. Center Section: Categories & Search */}
          <div className="hidden md:flex flex-grow items-center gap-2 max-w-3xl">
            
            {/* Category Dropdown (Desktop) */}
            <div className="hidden lg:block relative shrink-0">
               {loading ? (
                 <div className="w-24 h-8 bg-gray-100 animate-pulse rounded"></div>
               ) : (
                 <CategoryMenu categories={categories} />
               )}
            </div>

            {/* Modern Search Bar */}
            <form onSubmit={handleSearch} className="flex-grow relative group">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..." 
                  className="w-full bg-gray-50 border border-transparent text-gray-900 text-sm rounded-full py-2.5 pl-11 pr-4 
                             focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-300
                             placeholder:text-gray-400"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                   <Search size={18} />
                </div>
              </div>
            </form>
          </div>

          {/* 3. Right Section: Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Search Icon (Mobile Only) */}
            <button className="md:hidden p-2 text-gray-600 hover:text-blue-600">
              <Search size={22} />
            </button>

            {/* Support (Hidden on tiny screens) */}
            <Link to="/support" className="hidden xl:flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium text-sm px-2">
              <HelpCircle size={20} />
            </Link>

            {/* Wishlist (New!) */}
            <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all relative group" title="Wishlist">
              <Heart size={22} />
            </Link>

            {/* Account Dropdown */}
            <div 
              className="relative z-50" 
              onMouseEnter={() => setIsAccountOpen(true)} 
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <Link to="/account" className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <User size={22} />
                {/* Text hidden on tablet, shown on desktop if desired, or keep hidden for pure icon look */}
                <span className="hidden xl:block text-sm font-medium">Account</span>
              </Link>

              {/* Account Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute right-0 top-[90%] w-56 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl py-2 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-500">Welcome!</p>
                    <p className="text-sm font-bold text-gray-800">Manage Account</p>
                  </div>
                  <Link to="/login" className="px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-600 hover:text-blue-600 transition-colors">Log In</Link>
                  <Link to="/signup" className="px-4 py-2.5 hover:bg-gray-50 text-sm font-bold text-blue-600">Sign Up Free</Link>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <Link to="/orders" className="px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-600 block">My Orders</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart size={24} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;