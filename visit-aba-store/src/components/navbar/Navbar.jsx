import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Search, ShoppingCart, User, X, HelpCircle,
  Phone, LogOut, AlertCircle, CheckCircle, ShieldCheck,
  ChevronRight, Grid3X3, Heart, Home, Package, Scissors
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

/* ─── Bottom Nav Tab Definition ─────────────────────────────────────── */
// Used only on mobile. Each tab either navigates or triggers an action.
const BOTTOM_TABS = [
  { id: 'home',       label: 'Home',       icon: Home,     to: '/' },
  { id: 'categories', label: 'Categories', icon: Grid3X3,  to: null },     // opens sheet
  { id: 'custom',     label: 'Custom',     icon: Scissors, to: '/custom' }, // highlighted hero (center)
  { id: 'orders',     label: 'Orders',     icon: Package,  to: '/orders' },
  { id: 'account',    label: 'Account',    icon: User,     to: null },      // opens panel
];

const Navbar = () => {
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories, loading: categoriesLoading } = useCategories();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAccountOpen, setIsAccountOpen]         = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [scrolled, setScrolled]                   = useState(false);
  const [isAdmin, setIsAdmin]                     = useState(false);

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

  // Close mobile account panel when route changes
  useEffect(() => { setIsMobileAccountOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleBottomTab = (tab) => {
    if (tab.id === 'categories') {
      setIsCategorySheetOpen(true);
    } else if (tab.id === 'account') {
      setIsMobileAccountOpen((v) => !v);
    } else {
      navigate(tab.to);
    }
  };

  /* Derive active bottom tab from current path */
  const activeTab = (() => {
    const p = location.pathname;
    if (p === '/') return 'home';
    if (p.startsWith('/custom')) return 'custom';
    if (p.startsWith('/orders')) return 'orders';
    if (p.startsWith('/account') || p.startsWith('/login') || p.startsWith('/signup')) return 'account';
    return '';
  })();

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white text-[11px] font-bold py-2 tracking-wide border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 flex justify-between items-center">
          <span className="hidden sm:inline opacity-80">Welcome to Nigeria's Premium Store</span>
          <div className="flex gap-6 mx-auto sm:mx-0 w-full justify-center sm:w-auto sm:justify-end">
            {/* <span>FREE SHIPPING ON ORDERS OVER ₦100,000</span> */}
            <span className="hidden sm:block opacity-60">|</span>
            <span className="hidden sm:flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
              <Phone size={12} /> Enquiry: 07032220306
            </span>
            <Link to="/custom" className="hover:opacity-100 opacity-80 transition-opacity">Custom</Link>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ────────────────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 lg:gap-8">

          {/* ── LOGO ── always leftmost on all viewports ── */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 text-white shadow-md transform group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-2xl font-black tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">Explore</span>
                <span className="text-gray-900">Aba</span>
                <span className="text-emerald-500">.</span>
              </div>
            </Link>
          </div>

          {/* ── DESKTOP: search + category dropdown ── */}
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
                <button type="button" onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 transition-colors">
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* ── RIGHT ICONS ── */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* Mobile search toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-green-50 rounded-full active:scale-95 transition-all"
              onClick={() => setIsMobileSearchOpen((v) => !v)}
              aria-label="Search"
            >
              {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
            </button>

            {/* Desktop: Help */}
            <Link to="/support" className="hidden xl:flex flex-col items-center gap-0.5 text-gray-500 hover:text-green-600 transition-colors group">
              <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Help</span>
            </Link>

            {/* Desktop: Account dropdown */}
            <div
              className="hidden lg:block relative z-50"
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  isAuthenticated ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
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

              <div className={`absolute right-0 top-full pt-4 w-64 transition-all duration-200 ${
                isAccountOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
              }`}>
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
                      <Link to="/account"
                        className="block w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-800 transition shadow-md">
                        Manage Profile
                      </Link>
                    </div>
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-2">Welcome!</p>
                      <div className="flex gap-2">
                        <Link to="/login" state={{ from: location.pathname }}
                          className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-green-700 transition shadow-md shadow-green-200">
                          Log In
                        </Link>
                        <Link to="/signup"
                          className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg text-center hover:bg-gray-50 transition">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="py-2">
                    {isAdmin && (
                      <Link to="/admin/products"
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-green-700 font-bold bg-green-50/50 hover:bg-green-100 transition-colors border-b border-green-100 mb-1">
                        <ShieldCheck size={16} /> Admin Portal
                      </Link>
                    )}
                    <Link to="/orders"
                      className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 font-medium transition-colors">
                      📦 My Orders
                    </Link>
                  </div>

                  {isAuthenticated && (
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors flex items-center gap-2">
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist — now visible on ALL viewports (top-right cluster) */}
            <Link
              to="/wishlist"
              className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 rounded-full transition-all group ml-1 shadow-sm relative"
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
              <span className="text-sm font-bold hidden sm:block">
                ₦{cartTotal ? cartTotal.toLocaleString() : '0'}
              </span>
            </Link>
          </div>
        </div>

        {/* ── MOBILE SEARCH DRAWER ── */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileSearchOpen ? 'max-h-20 border-t border-gray-100' : 'max-h-0'
        }`}>
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

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE ACCOUNT SLIDE-UP PANEL
          Triggered by tapping the Account tab in the bottom nav.
      ══════════════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileAccountOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileAccountOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isMobileAccountOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pt-2 pb-4">
          {isAuthenticated ? (
            <>
              {/* Authenticated header */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-700 text-white flex items-center justify-center font-black text-xl shrink-0">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Hi, {user?.firstName}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
              </div>

              {user?.defaultAddress ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl mb-4">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-800 font-medium">Ready for fast checkout!</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl mb-4">
                  <AlertCircle size={14} className="text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 font-medium">Add your address for faster checkout.</p>
                </div>
              )}

              <div className="space-y-1">
                {isAdmin && (
                  <Link to="/admin/products" onClick={() => setIsMobileAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-green-700 bg-green-50 rounded-xl font-bold">
                    <ShieldCheck size={18} /> Admin Portal
                  </Link>
                )}
                <Link to="/account" onClick={() => setIsMobileAccountOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                  <span className="flex items-center gap-3"><User size={18} className="text-gray-400" /> Manage Profile</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
              </div>

              <button
                onClick={() => { handleLogout(); setIsMobileAccountOpen(false); }}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors"
              >
                <LogOut size={18} /> Log Out
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-black text-gray-900 mb-1">My Account</p>
              <p className="text-sm text-gray-500 mb-5">Sign in to access your orders, wishlist and more.</p>
              <div className="flex gap-3 mb-4">
                <Link to="/login" state={{ from: location.pathname }}
                  onClick={() => setIsMobileAccountOpen(false)}
                  className="flex-1 bg-green-600 text-white text-sm font-bold py-3 rounded-xl text-center shadow-md shadow-green-200">
                  Log In
                </Link>
                <Link to="/signup"
                  onClick={() => setIsMobileAccountOpen(false)}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-900 text-sm font-bold py-3 rounded-xl text-center">
                  Sign Up
                </Link>
              </div>
              <Link to="/support" onClick={() => setIsMobileAccountOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="flex items-center gap-3 font-medium"><HelpCircle size={18} className="text-gray-400" /> Help & Support</span>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR
          Fixed to the bottom, always visible on mobile/tablet.
          Hidden on lg+ (desktop uses the top nav).
      ══════════════════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch h-[62px]">
          {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAccountActive = tab.id === 'account' && isMobileAccountOpen;
            const badge = tab.id === 'orders' && cartCount > 0 ? cartCount : 0;

            /* ── Highlighted center "Custom" tab — the hero action ── */
            if (tab.id === 'custom') {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleBottomTab(tab)}
                  className="relative flex-1 flex flex-col items-center justify-end pb-1.5 gap-1 active:scale-95 transition-transform"
                  aria-label="Custom"
                >
                  <div className={`-mt-6 w-12 h-12 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg shadow-green-600/30 transition-colors ${
                    isActive ? 'bg-green-700' : 'bg-green-600'
                  }`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-bold leading-none text-green-600">Custom</span>
                </button>
              );
            }

            /* ── Standard tabs ── */
            return (
              <button
                key={tab.id}
                onClick={() => handleBottomTab(tab)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                  isActive || isAccountActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {(isActive || isAccountActive) && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full" />
                )}

                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive || isAccountActive ? 2.5 : 1.8}
                    className="transition-all duration-200"
                  />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-green-600 text-white text-[8px] font-black min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full border border-white">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── MOBILE CATEGORY SHEET ── */}
      <MobileCategorySheet
        categories={categories}
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
      />
    </>
  );
};

export default Navbar;