import React, { useState, useEffect, useRef } from 'react';
import {
  X, Package, MapPin, CreditCard, Clock, CheckCircle,
  Truck, RotateCcw, XCircle, Loader2, AlertTriangle,
  Copy, Phone, Mail, ArrowRight,
} from 'lucide-react';
import api      from '../../../../../api/axiosConfig';
import { toast }  from 'react-hot-toast';
import { fmt }    from '../../utils';

/* ─── Status / payment metadata ─────────────────────────────────────────── */
const STATUS_META = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'amber',  icon: Clock       },
  PROCESSING:      { label: 'Processing',       color: 'blue',   icon: Package     },
  CONFIRMED:       { label: 'Confirmed',        color: 'indigo', icon: CheckCircle },
  SHIPPED:         { label: 'Shipped',          color: 'violet', icon: Truck       },
  DELIVERED:       { label: 'Delivered',        color: 'green',  icon: CheckCircle },
  RETURNED:        { label: 'Returned',         color: 'orange', icon: RotateCcw   },
  CANCELLED:       { label: 'Cancelled',        color: 'red',    icon: XCircle     },
};

const PAYMENT_META = {
  PENDING:  { label: 'Pending',  color: 'amber' },
  SUCCESS:  { label: 'Paid',     color: 'green' },
  FAILED:   { label: 'Failed',   color: 'red'   },
  REFUNDED: { label: 'Refunded', color: 'slate' },
};

const CC = {
  amber:  { pill: 'bg-amber-50  text-amber-700  border-amber-200',  dot: 'bg-amber-500'  },
  blue:   { pill: 'bg-blue-50   text-blue-700   border-blue-200',   dot: 'bg-blue-500'   },
  indigo: { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  violet: { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  green:  { pill: 'bg-green-50  text-green-700  border-green-200',  dot: 'bg-green-500'  },
  orange: { pill: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  red:    { pill: 'bg-red-50    text-red-600    border-red-200',    dot: 'bg-red-500'    },
  slate:  { pill: 'bg-slate-100 text-slate-600  border-slate-200',  dot: 'bg-slate-400'  },
};

/**
 * Valid next statuses — mirrors the backend state machine in OrderService.
 * Keeping this in sync means the UI never offers a button that the backend
 * will reject with a 400/409.
 */
const NEXT_STATUSES = {
  PENDING_PAYMENT: ['PROCESSING', 'CANCELLED'],
  PROCESSING:      ['CONFIRMED',  'CANCELLED'],
  CONFIRMED:       ['SHIPPED',    'CANCELLED'],
  SHIPPED:         ['DELIVERED',  'RETURNED'],
  DELIVERED:       ['RETURNED'],
  RETURNED:        [],
  CANCELLED:       [],
};

/* ─── Small reusable pieces ──────────────────────────────────────────────── */
function StatusPill({ status, size = 'sm' }) {
  const meta = STATUS_META[status] || { label: status, color: 'slate', icon: Package };
  const cls  = CC[meta.color] || CC.slate;
  const Icon = meta.icon;
  const sz   = size === 'lg' ? 'text-xs px-3 py-1.5' : 'text-[10px] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold border rounded-full ${sz} ${cls.pill}`}>
      <Icon size={size === 'lg' ? 12 : 10} />
      {meta.label}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.15em] mb-3">{title}</p>
      {children}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-slate-300 hover:text-slate-600 transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle size={12} color="#16a34a" /> : <Copy size={12} />}
    </button>
  );
}

function AddressBlock({ address, label }) {
  if (!address) return null;
  const lines = [
    address.street || address.addressLine1,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      {lines.map((l, i) => <p key={i} className="text-sm text-slate-700 font-medium leading-snug">{l}</p>)}
      {address.phone && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200">
          <Phone size={11} />{address.phone}
        </p>
      )}
    </div>
  );
}

function StatusTimeline({ history = [] }) {
  if (!history.length) return (
    <p className="text-xs text-slate-400 italic">No status history yet.</p>
  );
  return (
    <div className="space-y-0">
      {[...history].reverse().map((h, i, arr) => {
        const meta = STATUS_META[h.status] || { label: h.status, color: 'slate' };
        const cls  = CC[meta.color] || CC.slate;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cls.dot}`} />
              {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
            </div>
            <div className="pb-4">
              <p className="text-xs font-bold text-slate-800">{meta.label}</p>
              {h.note && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{h.note}</p>}
              {h.timestamp && (
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(h.timestamp).toLocaleString('en-NG', {
                    day:'2-digit', month:'short', year:'numeric',
                    hour:'2-digit', minute:'2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function OrderDetailPanel({ orderId, onClose, onStatusChanged }) {
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const overlayRef = useRef(null);

  /* ── Load order ── */
  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    api.get(`/admin/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .catch(() => { toast.error('Could not load order'); onClose(); })
      .finally(() => setLoading(false));
  }, [orderId, onClose]);

  /* ── Close on backdrop click ── */
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  /* ── Advance status (PROCESSING → CONFIRMED → SHIPPED …) ── */
  const advanceStatus = async (newStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
        note: `Status updated to ${STATUS_META[newStatus]?.label ?? newStatus} by admin`,
      });
      const updated = res.data;
      setOrder(updated);
      toast.success(`Order marked as ${STATUS_META[newStatus]?.label ?? newStatus}`);
      onStatusChanged?.(updated);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(msg || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Cancel order ── ✅ FIX: was calling /api/v1/orders/{id}/cancel (customer
     endpoint with ownership check). Admin must use the admin endpoint. ── */
  const handleCancel = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/orders/${order.id}/cancel`, {
        reason: cancelNote.trim() || 'Cancelled by admin',
      });
      const updated = res.data;
      setOrder(updated);
      setShowCancel(false);
      setCancelNote('');
      toast.success('Order cancelled — stock restored');
      onStatusChanged?.(updated);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(msg || 'Cancel failed');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Derived ── */
  const nextStatuses   = order ? (NEXT_STATUSES[order.orderStatus] || []) : [];
  const canCancel      = order && !['SHIPPED','DELIVERED','CANCELLED','RETURNED'].includes(order.orderStatus);
  const nonCancelNext  = nextStatuses.filter(s => s !== 'CANCELLED');

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex justify-end"
      style={{ animation: 'fadeIn .18s ease' }}
    >
      <style>{`
        @keyframes slideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        .order-panel { animation: slideIn .28s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="order-panel w-full max-w-[520px] h-full bg-white flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="font-black text-slate-900 text-base tracking-tight">
                {loading ? '—' : (order?.orderNumber ?? '—')}
              </p>
              {order?.orderNumber && <CopyBtn text={order.orderNumber} />}
            </div>
            {order && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {new Date(order.createdAt).toLocaleString('en-NG', {
                  day:'2-digit', month:'short', year:'numeric',
                  hour:'2-digit', minute:'2-digit',
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {order && <StatusPill status={order.orderStatus} size="lg" />}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : !order ? null : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">

            {/* Customer */}
            <div className="px-5 py-4">
              <Section title="Customer">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.customerEmail}</p>
                    {order.shippingAddress?.recipientName && (
                      <p className="text-xs text-slate-500 mt-0.5">{order.shippingAddress.recipientName}</p>
                    )}
                  </div>
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                    title="Email customer"
                  >
                    <Mail size={12} />
                  </a>
                </div>
              </Section>
            </div>

            {/* Items */}
            <div className="px-5 py-4">
              <Section title={`Items · ${order.items?.length || 0}`}>
                <div className="space-y-2.5">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-slate-300" />
                            </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.productName}</p>
                        {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {Object.entries(item.variantAttributes).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                          </p>
                        )}
                        {item.sku && <p className="text-[10px] font-mono text-slate-300 mt-0.5">SKU: {item.sku}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-slate-900">₦{fmt(item.subTotal)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">₦{fmt(item.unitPrice)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Financials */}
            <div className="px-5 py-4">
              <Section title="Payment Breakdown">
                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {[
                    { label: 'Subtotal',   val: order.itemSubTotal,   negative: false },
                    { label: 'Shipping',   val: order.shippingFee,    negative: false },
                    { label: 'VAT (7.5%)', val: order.taxAmount,      negative: false },
                    { label: 'Discount',   val: order.discountAmount,  negative: true  },
                  ].filter(r => r.val != null && Number(r.val) !== 0).map(row => (
                    <div key={row.label} className="flex justify-between items-center px-4 py-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                      <span className={`text-xs font-bold ${row.negative ? 'text-green-600' : 'text-slate-700'}`}>
                        {row.negative ? '−' : ''}₦{fmt(row.val)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-900 rounded-b-xl">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Total</span>
                    <span className="text-base font-black text-white">₦{fmt(order.grandTotal)}</span>
                  </div>
                </div>

                {/* Payment method + status */}
                <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl">
                  <CreditCard size={13} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium flex-1">
                    {order.paymentMethod || 'N/A'}
                    {order.paymentReference && (
                      <span className="ml-2 font-mono text-[10px] text-slate-300">
                        ref: {order.paymentReference}
                      </span>
                    )}
                  </span>
                  {order.paymentStatus && (() => {
                    const pm  = PAYMENT_META[order.paymentStatus] || { label: order.paymentStatus, color: 'slate' };
                    const cls = CC[pm.color] || CC.slate;
                    return (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cls.pill}`}>
                        {pm.label}
                      </span>
                    );
                  })()}
                </div>

                {order.appliedPromoCode && (
                  <p className="text-[11px] text-green-600 font-bold mt-2 px-1">
                    🏷 Promo: {order.appliedPromoCode}
                  </p>
                )}
              </Section>
            </div>

            {/* Addresses */}
            <div className="px-5 py-4 space-y-3">
              <Section title="Addresses">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <AddressBlock address={order.shippingAddress} label="Ship to" />
                  {order.billingAddress && (
                    <AddressBlock address={order.billingAddress} label="Bill to" />
                  )}
                </div>
              </Section>
            </div>

            {/* Notes */}
            {order.orderNotes && (
              <div className="px-5 py-4">
                <Section title="Order Notes">
                  <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
                    {order.orderNotes}
                  </p>
                </Section>
              </div>
            )}

            {/* Timeline */}
            <div className="px-5 py-4">
              <Section title="Status History">
                <StatusTimeline history={order.statusHistory || []} />
              </Section>
            </div>

          </div>
        )}

        {/* ── Action footer ── */}
        {order && !loading && (
          <div className="flex-shrink-0 border-t border-slate-100 bg-white px-5 py-4 space-y-3">

            {/* Cancel confirmation */}
            {showCancel && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Confirm cancellation — stock will be restored
                </p>
                <textarea
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  placeholder="Reason (optional)"
                  rows={2}
                  className="w-full text-xs border border-red-200 rounded-lg px-3 py-2 resize-none outline-none focus:border-red-400 bg-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCancel(false); setCancelNote(''); }}
                    className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Never mind
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="flex-1 py-2 text-xs font-black bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {updating ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* Advance-status buttons */}
            {!showCancel && (
              <div className="flex flex-wrap gap-2">
                {nonCancelNext.map(status => {
                  const meta = STATUS_META[status];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => advanceStatus(status)}
                      disabled={updating}
                      className="flex-1 min-w-[120px] py-2.5 px-3 text-xs font-black bg-slate-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {updating
                        ? <Loader2 size={13} className="animate-spin" />
                        : <><Icon size={13} /> Mark {meta.label} <ArrowRight size={11} /></>}
                    </button>
                  );
                })}

                {canCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    disabled={updating}
                    className="py-2.5 px-3.5 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                )}

                {nextStatuses.length === 0 && (
                  <p className="text-xs text-slate-400 font-medium py-2 w-full text-center">
                    No further transitions available for this order.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}