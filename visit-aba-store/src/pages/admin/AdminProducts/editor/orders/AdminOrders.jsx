import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingBag, Search, RefreshCw, X, Loader2, Bell, BellOff,
  Filter, ChevronDown, Package, CheckCircle, Truck, Clock,
  XCircle, RotateCcw, AlertTriangle, TrendingUp, Eye,
} from 'lucide-react';
import api           from '../../../../../api/axiosConfig';
import { toast }     from 'react-hot-toast';
import { fmt }       from '../../utils';
import { Card }      from '../../SharedUI';
import OrderDetailPanel           from './OrderDetailPanel';
import { useOrderNotifications }  from '../../../../../hooks/useOrderNotifications';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const STATUS_META = {
  ALL:             { label: 'All Orders',     icon: ShoppingBag, color: 'slate'  },
  PENDING_PAYMENT: { label: 'Pending',        icon: Clock,       color: 'amber'  },
  PROCESSING:      { label: 'Processing',     icon: Package,     color: 'blue'   },
  CONFIRMED:       { label: 'Confirmed',      icon: CheckCircle, color: 'indigo' },
  SHIPPED:         { label: 'Shipped',        icon: Truck,       color: 'violet' },
  DELIVERED:       { label: 'Delivered',      icon: CheckCircle, color: 'green'  },
  RETURNED:        { label: 'Returned',       icon: RotateCcw,   color: 'orange' },
  CANCELLED:       { label: 'Cancelled',      icon: XCircle,     color: 'red'    },
};

const COLOR_CLASSES = {
  amber:  'bg-amber-50  text-amber-700  border-amber-200',
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red:    'bg-red-50    text-red-600    border-red-200',
  slate:  'bg-slate-100 text-slate-600  border-slate-200',
};

const DOT_CLASSES = {
  amber:'bg-amber-400', blue:'bg-blue-400', indigo:'bg-indigo-400',
  violet:'bg-violet-400', green:'bg-green-500', orange:'bg-orange-400',
  red:'bg-red-500', slate:'bg-slate-300',
};

function statusPill(status) {
  const m = STATUS_META[status] || { label: status, color: 'slate' };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${COLOR_CLASSES[m.color] || COLOR_CLASSES.slate}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_CLASSES[m.color] || DOT_CLASSES.slate}`} />
      {m.label}
    </span>
  );
}

function relativeTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day:'2-digit', month:'short' });
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }) {
  const pill = COLOR_CLASSES[color] || COLOR_CLASSES.slate;
  return (
    <div className={`rounded-2xl px-4 py-3.5 border flex items-start gap-3 ${pill}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-[11px] font-semibold mt-0.5 opacity-75">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('ALL');
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [selectedId,    setSelectedId]    = useState(null);
  const [showNotifTip,  setShowNotifTip]  = useState(false);
  const newOrderIdsRef = useRef(new Set());

  /* ── Notification hook ──────────────────────────────────────────────── */
  const handleNewOrders = useCallback((freshOrders) => {
    // Prepend new orders to the top of the current list (if on page 0)
    if (page === 0) {
      setOrders(prev => {
        const existingIds = new Set(prev.map(o => o.id));
        const truly_new   = freshOrders.filter(o => !existingIds.has(o.id));
        if (!truly_new.length) return prev;
        // Mark them visually for highlight
        truly_new.forEach(o => newOrderIdsRef.current.add(o.id));
        return [...truly_new, ...prev];
      });
    }
  }, [page]);

  const { unreadCount, clearUnread, permissionState, requestPermission }
    = useOrderNotifications({ onNewOrders: handleNewOrders });

  /* ── Fetch orders ───────────────────────────────────────────────────── */
  const fetchOrders = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = {
        page: pg, size: 20,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      };
      const res = await api.get('/admin/orders', { params });
      const data = res.data;
      setOrders(data.content ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
      setPage(pg);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(0); }, [fetchOrders]);

  /* ── Local filter by search ─────────────────────────────────────────── */
  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q) ||
      (o.items || []).some(i => i.productName?.toLowerCase().includes(q))
    );
  });

  /* ── Stats ──────────────────────────────────────────────────────────── */
  const stats = [
    { label:'Total Orders',  value: orders.length,                                                       color:'slate',  icon:ShoppingBag },
    { label:'Pending',       value: orders.filter(o=>o.orderStatus==='PENDING_PAYMENT').length,           color:'amber',  icon:Clock       },
    { label:'In Progress',   value: orders.filter(o=>['PROCESSING','CONFIRMED','SHIPPED'].includes(o.orderStatus)).length, color:'blue', icon:Truck },
    { label:'Delivered',     value: orders.filter(o=>o.orderStatus==='DELIVERED').length,                 color:'green',  icon:CheckCircle },
  ];

  /* ── Status tab bar items ───────────────────────────────────────────── */
  const tabStatuses = ['ALL','PENDING_PAYMENT','PROCESSING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'];

  /* ── Handle panel close ─────────────────────────────────────────────── */
  const handlePanelClose = () => setSelectedId(null);
  const handleStatusChanged = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
  };

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag size={20} className="text-slate-500" />
              Orders
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">{orders.length} orders · updates every 30 s</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  clearUnread();
                  if (permissionState !== 'granted') {
                    setShowNotifTip(true);
                    requestPermission().then(() => setShowNotifTip(false));
                  }
                }}
                title={
                  permissionState === 'granted'  ? 'Notifications on'  :
                  permissionState === 'denied'   ? 'Notifications blocked — enable in browser settings' :
                  'Click to enable notifications'
                }
                className={`relative p-2.5 rounded-xl border transition-all ${
                  permissionState === 'granted'
                    ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                    : permissionState === 'denied'
                    ? 'border-red-100 bg-red-50 text-red-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                }`}
              >
                {permissionState === 'denied' ? <BellOff size={15} /> : <Bell size={15} />}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Permission tooltip */}
              {showNotifTip && (
                <div className="absolute right-0 top-10 w-56 bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl z-50">
                  <p className="font-semibold">Allow notifications</p>
                  <p className="text-slate-400 text-[10px] mt-1">Click "Allow" in the browser prompt to get notified instantly when new orders arrive.</p>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchOrders(page)}
              className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Status tab strip ────────────────────────────────────────── */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-0 -mb-[1px]">
          {tabStatuses.map(s => {
            const m = STATUS_META[s];
            const Icon = m.icon;
            const isActive = statusFilter === s;
            const count = s === 'ALL'
              ? orders.length
              : orders.filter(o => o.orderStatus === s).length;
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); fetchOrders(0); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold whitespace-nowrap rounded-t-xl border-b-2 transition-all ${
                  isActive
                    ? 'text-slate-900 border-slate-900 bg-slate-50'
                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={12} />
                {m.label}
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Stat cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Notification permission banner ───────────────────────── */}
        {permissionState === 'default' && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5">
            <Bell size={16} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800">Enable order notifications</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Get instant alerts on desktop and mobile when new orders arrive — even without this tab open.
              </p>
            </div>
            <button
              onClick={() => requestPermission()}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Enable
            </button>
          </div>
        )}

        {permissionState === 'denied' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <BellOff size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Notifications are blocked. Go to <strong>browser Settings → Site settings → Notifications</strong> to allow them for this site.
            </p>
          </div>
        )}

        {/* ── Search bar ────────────────────────────────────────────── */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order number, email, or product name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all placeholder:text-slate-300"
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

        {/* ── Orders table ──────────────────────────────────────────── */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Placed</th>
                    <th className="px-5 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <ShoppingBag size={28} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-semibold text-sm">
                          {search ? `No results for "${search}"` : 'No orders yet'}
                        </p>
                      </td>
                    </tr>
                  ) : filtered.map(order => {
                    const isNew = newOrderIdsRef.current.has(order.id);
                    const itemSummary = (order.items || [])
                      .slice(0, 2)
                      .map(i => i.productName)
                      .join(', ');
                    const moreItems = (order.items?.length || 0) > 2
                      ? ` +${order.items.length - 2}` : '';

                    return (
                      <tr
                        key={order.id}
                        onClick={() => { setSelectedId(order.id); clearUnread(); newOrderIdsRef.current.delete(order.id); }}
                        className={`border-t border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                          isNew ? 'bg-green-50/60' : ''
                        }`}
                      >
                        {/* Order number */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isNew && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" title="New order" />
                            )}
                            <div>
                              <p className="font-black text-slate-900 text-xs font-mono group-hover:text-blue-700 transition-colors">
                                {order.orderNumber}
                              </p>
                              {isNew && (
                                <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 rounded-full">NEW</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                            {order.customerEmail}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-slate-600 max-w-[180px] truncate">
                            {itemSummary}{moreItems && <span className="text-slate-400">{moreItems} more</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-3.5">
                          <p className="font-black text-slate-900 text-sm">
                            ₦{fmt(order.grandTotal)}
                          </p>
                          {order.currency && (
                            <p className="text-[10px] text-slate-400">{order.currency}</p>
                          )}
                        </td>

                        {/* Order status */}
                        <td className="px-5 py-3.5">{statusPill(order.orderStatus)}</td>

                        {/* Payment status */}
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.paymentStatus === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.paymentStatus === 'FAILED'  ? 'bg-red-50 text-red-600 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.paymentStatus === 'SUCCESS' ? 'Paid'
                              : order.paymentStatus === 'FAILED' ? 'Failed'
                              : 'Pending'}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-slate-500 font-medium">{relativeTime(order.createdAt)}</p>
                          <p className="text-[10px] text-slate-300">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-NG', { day:'2-digit', month:'short' })
                              : ''}
                          </p>
                        </td>

                        {/* Open detail */}
                        <td className="px-5 py-3.5">
                          <button className="p-1.5 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => fetchOrders(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => fetchOrders(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Detail panel ──────────────────────────────────────────────── */}
      {selectedId && (
        <OrderDetailPanel
          orderId={selectedId}
          onClose={handlePanelClose}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
}