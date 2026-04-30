import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext'; // 👈 NEW
import {
  Search, ShoppingCart, User, Menu, X, HelpCircle,
  Phone, LogOut, AlertCircle, CheckCircle, ShieldCheck,
  ChevronRight, Grid3X3, Heart // 👈 NEW: Imported Heart
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryMenu from '../navbar/CategoryMenu';
import MobileCategorySheet from '../MobileCategorySheet';

const checkAdminFromToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const roles = decoded.roles || decoded.authorities || decoded.role || [];
    if (Array.isArray(roles)) {
      return roles.some((r) => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN');
    }
    return roles === 'ROLE_ADMIN';
  } catch { return false; }
};

const Navbar = () => {
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist(); // 👈 NEW: Get wishlist count
  const { categories, loading: categoriesLoading } = useCategories();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsAdmin(checkAdminFromToken() || user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ROLE_ADMIN');
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isCategorySheetOpen) {
      document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen, isCategorySheetOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const openCategorySheet = () => {
    setIsMobileMenuOpen(false); 
    setTimeout(() => setIsCategorySheetOpen(true), 250);
  };

  return (
    <>
      <div className="bg-gray-900 text-white text-[11px] font-bold py-2 tracking-wide border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 flex justify-between items-center">
          <span className="hidden sm:inline opacity-80">Welcome to Nigeria's Premium Store</span>
          <div className="flex gap-6 mx-auto sm:mx-0 w-full justify-center sm:w-auto sm:justify-end">
            <span> FREE SHIPPING ON ORDERS OVER ₦100,000</span>
            <span className="hidden sm:block opacity-60">|</span>
            <span className="hidden sm:flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
              <Phone size={12} /> Enquiry: 07032220306
            </span>
            <Link to="/custom" className="...">Custom</Link>
          </div>
        </div>
      </div>

      <nav className={`sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-white'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 lg:gap-8">

          <div className="flex items-center gap-3 shrink-0">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full active:scale-95 transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 text-white shadow-md transform group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-2xl font-black tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">Explore</span>
                <span className="text-gray-900">Aba</span>
                <span className="text-emerald-500">.</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center gap-6 max-w-4xl mx-auto">
            <div className="shrink-0 relative z-50">
              {categoriesLoading ? (
                <div className="w-36 h-9 bg-gray-100 animate-pulse rounded-full" />
              ) : (
                <CategoryMenu categories={categories} />
              )}
            </div>

            <form onSubmit={handleSearch} className="flex-1 relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full py-2.5 pl-12 pr-10 outline-none transition-all duration-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 shadow-inner placeholder:text-gray-400"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                <Search size={18} />
              </div>
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 transition-colors">
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-green-50 rounded-full active:scale-95 transition-all"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search size={22} />
            </button>

            <Link to="/support" className="hidden xl:flex flex-col items-center gap-0.5 text-gray-500 hover:text-green-600 transition-colors group">
              <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Help</span>
            </Link>

            <div className="hidden lg:block relative z-50" onMouseEnter={() => setIsAccountOpen(true)} onMouseLeave={() => setIsAccountOpen(false)}>
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className={`flex flex-col items-center gap-0.5 transition-colors ${isAuthenticated ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                {isAuthenticated && user?.firstName ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black text-[11px]">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User size={20} className="hover:scale-110 transition-transform" />
                )}
                <span className="text-[10px] font-bold">
                  {isAuthenticated && user?.firstName ? `Hi, ${user.firstName}` : 'Account'}
                </span>
              </Link>

              <div className={`absolute right-0 top-full pt-4 w-64 transition-all duration-200 ${isAccountOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <div className="bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
                  {isAuthenticated ? (
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 mb-2">My Account</p>
                      {user?.defaultAddress ? (
                        <div className="flex items-start gap-1.5 p-2 bg-green-50 border border-green-100 rounded-md mb-3">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-green-800 font-medium leading-tight">Ready for fast checkout!</p>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 p-2 bg-orange-50 border border-orange-100 rounded-md mb-3">
                          <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-orange-700 font-medium leading-tight">Add your address for faster checkout.</p>
                        </div>
                      )}
                      <Link to="/account" className="block w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-800 transition shadow-md">
                        Manage Profile
                      </Link>
                    </div>
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-2">Welcome!</p>
                      <div className="flex gap-2">
                        <Link to="/login" state={{ from: location.pathname }} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-green-700 transition shadow-md shadow-green-200">Log In</Link>
                        <Link to="/signup" className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-50 transition">Sign Up</Link>
                      </div>
                    </div>
                  )}

                  <div className="py-2">
                    {isAdmin && (
                      <Link to="/admin/products" className="flex items-center gap-2 px-5 py-2.5 text-sm text-green-700 font-bold bg-green-50/50 hover:bg-green-100 transition-colors border-b border-green-100 mb-1">
                        <ShieldCheck size={16} /> Admin Portal
                      </Link>
                    )}
                    <Link to="/orders" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 font-medium transition-colors">📦 My Orders</Link>
                  </div>

                  {isAuthenticated && (
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors flex items-center gap-2">
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 👈 NEW: Wishlist Icon (Always visible next to cart) */}
            <Link
              to="/wishlist"
              className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-full transition-all group ml-1 shadow-sm relative"
            >
              <Heart size={18} className="text-gray-600 group-hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart — always visible */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 hover:bg-green-600 hover:border-green-600 hover:text-white rounded-full transition-all group ml-1 sm:ml-2 shadow-sm"
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white group-hover:border-green-600 transition-colors">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold hidden sm:block">₦{cartTotal ? cartTotal.toLocaleString() : '0'}</span>
            </Link>
          </div>
        </div>

        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileSearchOpen ? 'max-h-20 border-t border-gray-100' : 'max-h-0'}`}>
          <div className="p-3 bg-gray-50">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 shadow-sm"
                autoFocus={isMobileSearchOpen}
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER OVERLAY ───────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER PANEL ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-700 text-white shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="text-xl font-black tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">Explore</span>
              <span className="text-gray-900">Aba</span>
              <span className="text-emerald-500">.</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">

          <div className="px-4 mb-5">
            {isAuthenticated ? (
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-700 text-white flex items-center justify-center font-black text-lg shrink-0">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Hi, {user?.firstName}</p>
                  <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-green-600 font-medium hover:underline">View Profile</Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl text-center shadow-md">Log In</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm font-bold py-2.5 rounded-xl text-center">Sign Up</Link>
              </div>
            )}
          </div>

          <div className="px-4 mb-4">
            <button
              onClick={openCategorySheet}
              className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all"
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Grid3X3 size={18} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black">Browse All Categories</p>
                <p className="text-[10px] text-white/70 font-medium">
                  {Array.isArray(categories) ? `${categories.length} categories` : 'Explore everything'}
                </p>
              </div>
              <ChevronRight size={18} className="text-white/70" />
            </button>
          </div>

          <div className="px-2">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-2">My Account</p>

            {isAdmin && (
              <Link to="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 mx-2 px-4 py-3 text-green-700 bg-green-50 rounded-xl mb-1 font-bold">
                <ShieldCheck size={18} /> Admin Portal
              </Link>
            )}

            {[
              { to: '/orders', icon: <ShoppingCart size={18} className="text-gray-400" />, label: 'My Orders' },
              { to: '/wishlist', icon: <Heart size={18} className="text-red-400" />, label: 'Saved Items', badge: wishlistCount }, // 👈 Updated icon and added badge
              { to: '/support', icon: <HelpCircle size={18} className="text-gray-400" />, label: 'Help & Support' },
            ].map(({ to, icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 mx-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 font-medium">
                  {icon} {label} 
                  {badge > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {isAuthenticated && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        )}
      </div>

      <MobileCategorySheet
        categories={categories}
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
      />
    </>
  );
};

export default Navbar;