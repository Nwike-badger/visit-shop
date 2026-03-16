import React from 'react';
import {
  Package, Plus, Search, RefreshCw, X, Loader2,
  Image as ImageIcon, CheckCircle, EyeOff, Trash2,
  TrendingUp, AlertTriangle,
} from 'lucide-react';
import { fmt, isActive } from './utils';
import { Card } from './SharedUI';

export default function ProductList({ products, loading, search, setSearch, deleting, onRefresh, onAdd, onEdit, onDelete }) {
  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
    p.brandName?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: 'Total products',
      val: products.length,
      icon: <Package size={16} />,
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200',
    },
    {
      label: 'Active listings',
      val: products.filter(isActive).length,
      icon: <CheckCircle size={16} />,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
    },
    {
      label: 'Low stock',
      val: products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length,
      icon: <AlertTriangle size={16} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Out of stock',
      val: products.filter(p => (p.stockQuantity || 0) === 0).length,
      icon: <TrendingUp size={16} />,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 p-6 font-sans">

      {/* Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package size={20} className="text-blue-600" /> Products
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{products.length} items in your catalog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onAdd}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/15"
          >
            <Plus size={14} /> Add product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3.5 border ${s.bg} flex items-start gap-3`}>
            <span className={`mt-0.5 ${s.color}`}>{s.icon}</span>
            <div>
              <p className={`text-2xl font-black leading-none ${s.color}`}>{s.val}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, slug, category or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all placeholder:text-slate-300"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-300">
            <Loader2 size={22} className="animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category / Brand</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Package size={28} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 font-semibold text-sm">
                        {search ? `No results for "${search}"` : 'No products yet — add your first!'}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => onEdit(p.id)}
                    className="border-t border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:border-slate-300 transition-colors">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={13} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate max-w-[220px] group-hover:text-blue-700 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category / Brand */}
                    <td className="px-5 py-3.5">
                      {p.categoryName
                        ? <p className="text-xs font-semibold text-slate-700">{p.categoryName}</p>
                        : <p className="text-xs text-slate-300">—</p>}
                      {p.brandName && <p className="text-[11px] text-slate-400">{p.brandName}</p>}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">₦{fmt(p.price)}</p>
                      {p.compareAtPrice > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">₦{fmt(p.compareAtPrice)}</p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        (p.stockQuantity || 0) === 0
                          ? 'bg-red-50 text-red-600'
                          : (p.stockQuantity || 0) <= 10
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {(p.stockQuantity || 0) === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {isActive(p) ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" /> Draft
                        </span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => onDelete(p.id, e)}
                        disabled={deleting[p.id]}
                        className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {deleting[p.id]
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > 0 && !loading && (
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Showing {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}