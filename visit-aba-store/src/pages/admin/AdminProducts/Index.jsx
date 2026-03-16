import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { getErr } from './utils';
import ProductList   from './ProductList';
import ProductEditor from './ProductEditor';

export default function AdminProducts() {
  const [view,       setView]       = useState('list');
  const [editingId,  setEditingId]  = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [deleting,   setDeleting]   = useState({});

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
    setDeleting((d) => ({ ...d, [productId]: true }));
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      fetchAll();
    } catch (err) {
      toast.error(getErr(err));
      setDeleting((d) => ({ ...d, [productId]: false }));
    }
  };

  if (view === 'list') {
    return (
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
    );
  }

  return (
    <ProductEditor
      productId={editingId}
      onBack={closeEditor}
      categories={categories}
      brands={brands}
    />
  );
}