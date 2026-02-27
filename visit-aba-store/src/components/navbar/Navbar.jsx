import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../api/axiosConfig';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X,
  HelpCircle,
  Phone,
  LogOut,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryMenu from '../navbar/CategoryMenu';

const Navbar = () => {
  const { cartCount, cartTotal } = useCart();
  const { categories, loading } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // 🔥 1. SMART AUTH CHECK: Check if user has a token
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/v1/users/me')
        .then(res => setUserData(res.data))
        .catch(err => console.error("Failed to load user info", err));
    }
  }, [isLoggedIn]);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 🔥 2. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };

  return (
    <>
      {/* 1. TOP BANNER */}
      <div className="bg-gray-900 text-white text-[11px] font-bold py-2 tracking-wide border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 flex justify-between items-center">
            <span className="hidden sm:inline opacity-80">Welcome to Nigeria's Premium Store</span>
            <div className="flex gap-6 mx-auto sm:mx-0">
                <span>🚀 FREE SHIPPING ON ORDERS OVER ₦50,000</span>
                <span className="hidden sm:block opacity-60">|</span>
                <span className="hidden sm:flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                    <Phone size={12}/> Support: 0800-VISIT-ABA
                </span>
            </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${
            scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-8">
          
          {/* LEFT: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="flex items-center gap-1 group">
              <div className="text-2xl font-black tracking-tighter text-blue-600 group-hover:text-blue-700 transition-colors">
                Visit<span className="text-gray-900">Aba</span><span className="text-blue-600">.</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Search & Categories */}
          <div className="hidden md:flex flex-1 items-center gap-6 max-w-4xl mx-auto">
            <div className="shrink-0 relative">
               {loading ? (
                 <div className="w-24 h-8 bg-gray-100 animate-pulse rounded"></div>
               ) : (
                 <CategoryMenu categories={categories} />
               )}
            </div>

            <form onSubmit={handleSearch} className="flex-1 relative group">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for today?" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full py-3 pl-12 pr-12 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 shadow-sm placeholder:text-gray-400"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                   <Search size={20} />
                </div>
                {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition">
                        <X size={14} />
                    </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: Icons & User Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Search size={24} />
            </button>

            <Link to="/support" className="hidden xl:flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-blue-600 transition-colors group">
              <HelpCircle size={22} className="group-hover:scale-110 transition-transform"/>
              <span className="text-[10px] font-bold">Help</span>
            </Link>

            {/* 🔥 3. INTELLIGENT ACCOUNT DROPDOWN */}
            <div 
              className="relative z-50 group" 
              onMouseEnter={() => setIsAccountOpen(true)} 
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <Link 
                to={isLoggedIn ? "/account" : "/login"} 
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isLoggedIn ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              >
                {/* Dynamic Avatar or User Icon */}
                {isLoggedIn && userData ? (
                   <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[11px] mb-[2px]">
                     {userData.firstName.charAt(0).toUpperCase()}
                   </div>
                ) : (
                   <User size={22} className="group-hover:scale-110 transition-transform"/>
                )}
                
                <span className="text-[10px] font-bold">
                  {isLoggedIn && userData ? `Hi, ${userData.firstName}` : 'Account'}
                </span>
              </Link>

              {isAccountOpen && (
                <div className="absolute right-0 top-full pt-2 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden">
                        
                        {/* CONDITIONAL RENDER: Logged In vs Logged Out */}
                        {isLoggedIn ? (
                           <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                               <p className="text-sm font-bold text-gray-900 mb-1">My Account</p>
                               
                               {/* 🔥 SMART NUDGE LOGIC */}
                               {userData?.defaultAddress ? (
                                   <div className="flex items-start gap-1.5 p-2 bg-green-50 border border-green-100 rounded-md mb-3">
                                      <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                      <p className="text-[10px] text-green-800 font-medium leading-tight">
                                        Ready for fast checkout!
                                      </p>
                                   </div>
                               ) : (
                                   <div className="flex items-start gap-1.5 p-2 bg-orange-50 border border-orange-100 rounded-md mb-3">
                                      <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                      <p className="text-[10px] text-orange-700 font-medium leading-tight">
                                        Your profile is incomplete. Add your address for faster checkout.
                                      </p>
                                   </div>
                               )}

                               <Link to="/account" className="block w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-800 transition shadow-md">
                                 Manage Profile
                               </Link>
                           </div>
                        ) : (
                           <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                               <p className="text-xs text-gray-500 font-medium mb-1">Welcome!</p>
                               <div className="flex gap-2">
                                   <Link to="/login" state={{ from: location.pathname }} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-blue-700 transition shadow-md shadow-blue-200">Log In</Link>
                                   <Link to="/signup" className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-50 transition">Sign Up</Link>
                               </div>
                           </div>
                        )}

                        {/* Standard Links */}
                        <div className="py-2">
                            <Link to="/orders" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">📦 My Orders</Link>
                            <Link to="/wishlist" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors">❤️ Saved Items</Link>
                        </div>

                        {/* Logout Button */}
                        {isLoggedIn && (
                           <div className="border-t border-gray-100 py-1">
                               <button 
                                 onClick={handleLogout}
                                 className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
                               >
                                 <LogOut size={16} /> Log Out
                               </button>
                           </div>
                        )}
                    </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full transition-all group ml-2">
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white group-hover:border-blue-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold hidden sm:block">
                 ₦{cartTotal ? cartTotal.toLocaleString() : '0'}
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;