import React, { useState, useEffect, useCallback } from 'react';
import {
  Scissors, Search, RefreshCw, X, Loader2, Eye,
  Clock, CheckCircle, Truck, XCircle, Package,
  AlertTriangle, ChevronDown,
} from 'lucide-react';
import api        from '../../../../../api/axiosConfig';
import { toast }  from 'react-hot-toast';
import { fmt }    from '../../utils';
import { Card }   from '../../SharedUI';
import CustomOrderDetailPanel from './CustomOrderDetailPanel';

// ─── Status metadata ────────────────────────────────────────────────────────

const STATUS_META = {
  ALL:           { label: 'All',          icon: Scissors,     color: 'slate'  },
  SUBMITTED:     { label: 'Submitted',    icon: Clock,        color: 'amber'  },
  QUOTED:        { label: 'Quoted',       icon: CheckCircle,  color: 'blue'   },
  DEPOSIT_PAID:  { label: 'Deposit Paid', icon: CheckCircle,  color: 'indigo' },
  IN_PRODUCTION: { label: 'In Production',icon: Package,      color: 'violet' },
  READY:         { label: 'Ready',        icon: CheckCircle,  color: 'green'  },
  SHIPPED:       { label: 'Shipped',      icon: Truck,        color: 'teal'   },
  DELIVERED:     { label: 'Delivered',    icon: CheckCircle,  color: 'green'  },
  COMPLETED:     { label: 'Completed',    icon: CheckCircle,  color: 'green'  },
  CANCELLED:     { label: 'Cancelled',    icon: XCircle,      color: 'red'    },
  REJECTED:      { label: 'Rejected',     icon: XCircle,      color: 'red'    },
};

const COLOR_CLASSES = {
  amber:  'bg-amber-50  text-amber-700  border-amber-200',
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  teal:   'bg-teal-50   text-teal-700   border-teal-200',
  red:    'bg-red-50    text-red-600    border-red-200',
  slate:  'bg-slate-100 text-slate-600  border-slate-200',
};

const DOT_CLASSES = {
  amber:'bg-amber-400', blue:'bg-blue-400', indigo:'bg-indigo-400',
  violet:'bg-violet-400', green:'bg-green-500', teal:'bg-teal-400',
  red:'bg-red-500', slate:'bg-slate-300',
};

function StatusPill({ status }) {
  const m   = STATUS_META[status] || { label: status, color: 'slate' };
  const cls = COLOR_CLASSES[m.color] || COLOR_CLASSES.slate;
  const dot = DOT_CLASSES[m.color]   || DOT_CLASSES.slate;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
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

const TAB_STATUSES = [
  'ALL','SUBMITTED','QUOTED','DEPOSIT_PAID','IN_PRODUCTION','READY','SHIPPED','DELIVERED','COMPLETED','CANCELLED',
];

// ─── Main ────────────────────────────────────────────────────────────────────

export default function AdminCustomOrders() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [selectedRef,  setSelectedRef]  = useState(null);

  const fetchOrders = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = {
        page: pg, size: 20,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      };
      const res  = await api.get('/v1/custom-orders', { params });
      const data = res.data;
      setOrders(data.content ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
      setPage(pg);
    } catch {
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(0); }, [fetchOrders]);

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.referenceNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q)    ||
      o.customerEmail?.toLowerCase().includes(q)   ||
      o.whatsappNumber?.toLowerCase().includes(q)  ||
      o.categoryName?.toLowerCase().includes(q)
    );
  });

  const stats = [
    { label: 'Total',      value: orders.length,                                              color: 'slate',  icon: Scissors     },
    { label: 'Submitted',  value: orders.filter(o => o.status === 'SUBMITTED').length,        color: 'amber',  icon: Clock        },
    { label: 'Quoted',     value: orders.filter(o => o.status === 'QUOTED').length,           color: 'blue',   icon: CheckCircle  },
    { label: 'Production', value: orders.filter(o => o.status === 'IN_PRODUCTION').length,    color: 'violet', icon: Package      },
  ];

  const handleStatusChanged = (updatedRef, newData) => {
    setOrders(prev => prev.map(o =>
      o.referenceNumber === updatedRef ? { ...o, ...newData } : o
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans">

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Scissors size={20} className="text-slate-500" />
              Custom Orders
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">{orders.length} made-to-measure orders</p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-0 -mb-[1px]">
          {TAB_STATUSES.map(s => {
            const m    = STATUS_META[s];
            const Icon = m.icon;
            const isAct = statusFilter === s;
            const count = s === 'ALL'
              ? orders.length
              : orders.filter(o => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); fetchOrders(0); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold whitespace-nowrap rounded-t-xl border-b-2 transition-all ${
                  isAct
                    ? 'text-slate-900 border-slate-900 bg-slate-50'
                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={12} />
                {m.label}
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    isAct ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
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

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => {
            const Icon = s.icon;
            const pill = COLOR_CLASSES[s.color] || COLOR_CLASSES.slate;
            return (
              <div key={s.label} className={`rounded-2xl px-4 py-3.5 border flex items-start gap-3 ${pill}`}>
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-black leading-none">{s.value}</p>
                  <p className="text-[11px] font-semibold mt-0.5 opacity-75">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reference, name, email, WhatsApp, or garment…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all placeholder:text-slate-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Garment</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Style Preview</th>
                    <th className="px-5 py-3.5">Quoted</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Received</th>
                    <th className="px-5 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <Scissors size={28} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-semibold text-sm">
                          {search ? `No results for "${search}"` : 'No custom orders yet'}
                        </p>
                      </td>
                    </tr>
                  ) : filtered.map(order => (
                    <tr
                      key={order.referenceNumber}
                      onClick={() => setSelectedRef(order.referenceNumber)}
                      className="border-t border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Reference */}
                      <td className="px-5 py-3.5">
                        <p className="font-black text-slate-900 text-xs font-mono group-hover:text-blue-700 transition-colors">
                          {order.referenceNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{order.gender?.toLowerCase()}</p>
                      </td>

                      {/* Garment */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-slate-800">{order.categoryName}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-slate-700 max-w-[140px] truncate">{order.customerName}</p>
                        {order.whatsappNumber && (
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{order.whatsappNumber}</p>
                        )}
                      </td>

                      {/* Style preview — real images if uploaded, placeholder otherwise */}
                      <td className="px-5 py-3.5">
                        <StyleThumbnails referenceImageUrls={order.referenceImageUrls} />
                      </td>

                      {/* Quoted amount */}
                      <td className="px-5 py-3.5">
                        {order.quotedAmount ? (
                          <div>
                            <p className="font-black text-slate-900 text-sm">₦{fmt(order.quotedAmount)}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {order.depositPaid ? '✓ Deposit paid' : 'Deposit pending'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5"><StatusPill status={order.status} /></td>

                      {/* Time */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-slate-500 font-medium">{relativeTime(order.createdAt)}</p>
                      </td>

                      {/* Open */}
                      <td className="px-5 py-3.5">
                        <button className="p-1.5 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => fetchOrders(page - 1)} disabled={page === 0}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">
              ← Prev
            </button>
            <span className="text-xs text-slate-500 font-medium">Page {page + 1} of {totalPages}</span>
            <button onClick={() => fetchOrders(page + 1)} disabled={page >= totalPages - 1}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedRef && (
        <CustomOrderDetailPanel
          referenceNumber={selectedRef}
          onClose={() => setSelectedRef(null)}
          onChanged={(ref, data) => { handleStatusChanged(ref, data); fetchOrders(page); }}
        />
      )}
    </div>
  );
}

// Renders up to 3 small thumbnails from reference image URLs.
// If there are no images yet, shows a neutral placeholder.
function StyleThumbnails({ referenceImageUrls = [] }) {
  const urls = (referenceImageUrls || []).slice(0, 3);
  if (urls.length === 0) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
        <Scissors size={12} className="text-slate-300" />
      </div>
    );
  }
  return (
    <div className="flex -space-x-2">
      {urls.map((url, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100 shadow-sm"
          style={{ zIndex: urls.length - i }}
        >
          <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        </div>
      ))}
    </div>
  );
}