import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { getErr } from './utils';
import { Package, FolderTree, Tag, ShoppingBag } from 'lucide-react';
import ProductList     from './ProductList';
import ProductEditor   from './ProductEditor';
import CategoryManager from './editor/CategoryManager';
import BrandManager    from './editor/BrandManager';
import AdminOrders     from '../AdminProducts/editor/orders/AdminOrders';
import { useOrderNotifications } from '../../../hooks/useOrderNotifications';

export default function AdminProducts() {
  const [view,       setView]       = useState('list');
  const [editingId,  setEditingId]  = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [deleting,   setDeleting]   = useState({});

  
  const { unreadCount, clearUnread } = useOrderNotifications();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products?page=0&size=100'),
        api.get('/categories/tree').catch(() => ({ data: [] })),
        api.get('/brands').catch(() => ({ data: [] })),
      ]);
      setProducts(pRes.data.content ?? pRes.data ?? []);
      setCategories(cRes.data || []);
      const bData = bRes.data;
      setBrands(Array.isArray(bData) ? bData : (bData?.content ?? []));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openEditor  = (id = null) => { setEditingId(id); setView('form'); };
  const closeEditor = ()          => { setEditingId(null); setView('list'); fetchAll(); };

  const handleDelete = async (productId, e) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this product and all its variants?')) return;
    setDeleting(d => ({ ...d, [productId]: true }));
    try {
      await api.delete('/products/' + productId);
      toast.success('Product deleted');
      fetchAll();
    } catch (err) {
      toast.error(getErr(err));
      setDeleting(d => ({ ...d, [productId]: false }));
    }
  };

  // Full-page views that replace the tab layout entirely
  if (view === 'categories') return <CategoryManager onBack={() => { setView('list'); fetchAll(); }} />;
  if (view === 'brands')     return <BrandManager    onBack={() => { setView('list'); fetchAll(); }} />;
  if (view === 'form') {
    return (
      <ProductEditor
        productId={editingId}
        onBack={closeEditor}
        categories={categories}
        brands={brands}
      />
    );
  }

  return (
    <div>
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 px-6 pt-5 border-b border-slate-200 bg-white">
        <TabButton
          active={view === 'list'}
          onClick={() => setView('list')}
          icon={<Package size={13} />}
        >
          Products
        </TabButton>

        <TabButton
          active={view === 'categories'}
          onClick={() => setView('categories')}
          icon={<FolderTree size={13} />}
        >
          Categories
        </TabButton>

        <TabButton
          active={view === 'brands'}
          onClick={() => setView('brands')}
          icon={<Tag size={13} />}
        >
          Brands
        </TabButton>

        <TabButton
          active={view === 'orders'}
          onClick={() => { setView('orders'); clearUnread(); }}
          icon={<ShoppingBag size={13} />}
          badge={unreadCount}
        >
          Orders
        </TabButton>
      </div>

      {/* ── Tab content ── */}
      {view === 'orders' ? (
        <AdminOrders />
      ) : (
        <ProductList
          products={products}
          loading={loading}
          search={search}
          setSearch={setSearch}
          deleting={deleting}
          onRefresh={fetchAll}
          onAdd={() => openEditor()}
          onEdit={(id) => openEditor(id)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function TabButton({ children, active, onClick, icon, badge }) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors -mb-px',
        active
          ? 'text-slate-900 border-slate-900 bg-slate-50'
          : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50',
      ].join(' ')}
    >
      {icon}
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}