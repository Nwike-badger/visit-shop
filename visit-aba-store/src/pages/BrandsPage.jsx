import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Tag, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axiosConfig';
import BrandLogo from '../components/brand/BrandLogo';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/brands');
      const list = Array.isArray(res.data) ? res.data : [];
      setBrands([...list].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  return (
    <div className="bg-gray-50/30 min-h-screen pb-24 font-sans">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-emerald-800/20" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <nav className="flex items-center gap-1.5 mb-5 text-xs font-bold text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-white">Brands</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">Brands</h1>
              <p className="text-gray-400 font-medium text-sm">Shop your favourite labels, all in one place.</p>
            </div>
            {!loading && !error && brands.length > 0 && (
              <p className="text-gray-400 text-sm font-medium">
                <span className="text-white font-black text-2xl">{brands.length}</span>
                {' '}brand{brands.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 animate-pulse">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Couldn't load brands</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Check your connection and try again.</p>
            <button
              onClick={fetchBrands}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 mb-6 shadow-sm border border-gray-100">
              <Tag size={36} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No brands yet</h3>
            <p className="text-gray-500 font-medium max-w-sm">New brands are on the way — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id || brand.slug}
                to={`/brand/${brand.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-green-300 hover:shadow-md transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
              >
                <BrandLogo brand={brand} className="w-20 h-20" textClassName="text-3xl" />
                <div className="w-full">
                  <p className="font-bold text-sm text-gray-900 group-hover:text-green-700 transition-colors truncate">
                    {brand.name}
                  </p>
                  {brand.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{brand.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;