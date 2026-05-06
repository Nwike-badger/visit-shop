import React, { useState, useEffect, useRef } from 'react';
import {
  X, Loader2, Copy, CheckCircle, XCircle, AlertTriangle,
  Upload, Trash2, MessageCircle, ArrowRight, Package,
  Clock, Truck, Ruler, Phone, Mail, MapPin, Image as ImageIcon,
  Scissors, ChevronDown, DollarSign, Check,
} from 'lucide-react';
import api      from '../../../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { fmt }   from '../../utils';

// ─── Status / colour helpers ──────────────────────────────────────────────

const STATUS_META = {
  SUBMITTED:     { label: 'Submitted',     color: 'amber',  icon: Clock       },
  QUOTED:        { label: 'Quoted',        color: 'blue',   icon: CheckCircle },
  DEPOSIT_PAID:  { label: 'Deposit Paid',  color: 'indigo', icon: CheckCircle },
  IN_PRODUCTION: { label: 'In Production', color: 'violet', icon: Package     },
  READY:         { label: 'Ready',         color: 'green',  icon: CheckCircle },
  SHIPPED:       { label: 'Shipped',       color: 'teal',   icon: Truck       },
  DELIVERED:     { label: 'Delivered',     color: 'green',  icon: CheckCircle },
  COMPLETED:     { label: 'Completed',     color: 'green',  icon: CheckCircle },
  CANCELLED:     { label: 'Cancelled',     color: 'red',    icon: XCircle     },
  REJECTED:      { label: 'Rejected',      color: 'red',    icon: XCircle     },
};

const CC = {
  amber:  { pill:'bg-amber-50  text-amber-700  border-amber-200',  dot:'bg-amber-500'  },
  blue:   { pill:'bg-blue-50   text-blue-700   border-blue-200',   dot:'bg-blue-500'   },
  indigo: { pill:'bg-indigo-50 text-indigo-700 border-indigo-200', dot:'bg-indigo-500' },
  violet: { pill:'bg-violet-50 text-violet-700 border-violet-200', dot:'bg-violet-500' },
  green:  { pill:'bg-green-50  text-green-700  border-green-200',  dot:'bg-green-500'  },
  teal:   { pill:'bg-teal-50   text-teal-700   border-teal-200',   dot:'bg-teal-500'   },
  red:    { pill:'bg-red-50    text-red-600    border-red-200',    dot:'bg-red-500'    },
  slate:  { pill:'bg-slate-100 text-slate-600  border-slate-200',  dot:'bg-slate-400'  },
};

/**
 * State machine — mirrors ALLOWED_TRANSITIONS in CustomOrderService.java.
 * Admin actions are the non-CANCEL transitions; cancel is surfaced separately.
 */
const NEXT_STATUSES = {
  SUBMITTED:     ['QUOTED', 'REJECTED', 'CANCELLED'],
  QUOTED:        ['DEPOSIT_PAID', 'CANCELLED'],
  DEPOSIT_PAID:  ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['READY', 'CANCELLED'],
  READY:         ['SHIPPED', 'DELIVERED'],
  SHIPPED:       ['DELIVERED'],
  DELIVERED:     ['COMPLETED'],
  COMPLETED:     [],
  CANCELLED:     [],
  REJECTED:      [],
};

// ─── Tiny reusables ───────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.15em] mb-3">{title}</p>
      {children}
    </div>
  );
}

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

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-slate-300 hover:text-slate-600 transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle size={12} color="#16a34a" /> : <Copy size={12} />}
    </button>
  );
}

function StatusTimeline({ history = [] }) {
  if (!history.length) return <p className="text-xs text-slate-400 italic">No history yet.</p>;
  return (
    <div>
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
              {h.note   && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{h.note}</p>}
              {h.actor  && <p className="text-[10px] text-slate-400 mt-0.5">by {h.actor}</p>}
              {h.timestamp && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(h.timestamp).toLocaleString('en-NG', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────

export default function CustomOrderDetailPanel({ referenceNumber, onClose, onChanged }) {
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);

  // Quote form
  const [showQuote,   setShowQuote]   = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes,  setQuoteNotes]  = useState('');

  // Status note (non-quote transitions)
  const [statusNote,  setStatusNote]  = useState('');

  // Cancel form
  const [showCancel,  setShowCancel]  = useState(false);
  const [cancelNote,  setCancelNote]  = useState('');

  // Image upload (admin can add more reference images)
  const [uploading,   setUploading]   = useState(false);
  const fileRef = useRef(null);

  const overlayRef = useRef(null);
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  // ── Load order ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!referenceNumber) return;
    setLoading(true);
    api.get(`/v1/custom-orders/${referenceNumber}`)
      .then(r  => setOrder(r.data))
      .catch(() => { toast.error('Could not load order'); onClose(); })
      .finally(() => setLoading(false));
  }, [referenceNumber, onClose]);

  // ── Quote ─────────────────────────────────────────────────────────────

  const handleApplyQuote = async () => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid quoted amount'); return; }
    setUpdating(true);
    try {
      const res = await api.post(`/v1/custom-orders/${referenceNumber}/quote`, {
        quotedAmount: amount,
        quoteNotes: quoteNotes.trim() || null,
      });
      setOrder(res.data);
      setShowQuote(false);
      setQuoteAmount('');
      setQuoteNotes('');
      toast.success(`Quote of ₦${fmt(amount)} applied — deposit ₦${fmt(amount * 0.5)}`);
      onChanged?.(referenceNumber, res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply quote');
    } finally {
      setUpdating(false);
    }
  };

  // ── Status transition (non-quote, non-cancel) ────────────────────────

  const advanceStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await api.post(`/v1/custom-orders/${referenceNumber}/status`, {
        newStatus,
        note: statusNote.trim() || `Moved to ${STATUS_META[newStatus]?.label ?? newStatus} by admin`,
      });
      setOrder(res.data);
      setStatusNote('');
      toast.success(`Order is now ${STATUS_META[newStatus]?.label ?? newStatus}`);
      onChanged?.(referenceNumber, res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    setUpdating(true);
    try {
      const res = await api.post(`/v1/custom-orders/${referenceNumber}/status`, {
        newStatus: 'CANCELLED',
        note: cancelNote.trim() || 'Cancelled by admin',
      });
      setOrder(res.data);
      setShowCancel(false);
      setCancelNote('');
      toast.success('Order cancelled');
      onChanged?.(referenceNumber, res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setUpdating(false);
    }
  };

  // ── Image upload ──────────────────────────────────────────────────────

  const handleImageUpload = async (files) => {
    const fileArr = Array.from(files || []);
    if (!fileArr.length) return;

    // Limit to 4 total reference images
    const existing = order?.style?.referenceImageUrls?.length || 0;
    if (existing + fileArr.length > 4) {
      toast.error(`Max 4 reference images. You have ${existing} already.`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of fileArr) {
        if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue; }
        if (file.size > 10 * 1024 * 1024)   { toast.error(`${file.name} exceeds 10MB`);    continue; }

        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/v1/custom-uploads/style-reference', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(res.data.url);
      }

      if (uploadedUrls.length > 0) {
        // Optimistically update local order state — the backend does not have
        // a "patch style images" endpoint yet (see FUTURE IMPROVEMENTS).
        setOrder(prev => ({
          ...prev,
          style: {
            ...prev.style,
            referenceImageUrls: [...(prev.style?.referenceImageUrls || []), ...uploadedUrls],
          },
        }));
        toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────

  const currentStatus = order?.status;
  const nextAll       = currentStatus ? (NEXT_STATUSES[currentStatus] || []) : [];
  const nonCancelNext = nextAll.filter(s => s !== 'CANCELLED' && s !== 'REJECTED');
  const canCancel     = nextAll.includes('CANCELLED');
  const canReject     = nextAll.includes('REJECTED');
  const needsQuote    = currentStatus === 'SUBMITTED'; // primary admin action

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
        .custom-panel { animation: slideIn .28s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="custom-panel w-full max-w-[560px] h-full bg-white flex flex-col shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="font-black text-slate-900 text-base tracking-tight font-mono">
                {loading ? '—' : (order?.referenceNumber ?? '—')}
              </p>
              {order?.referenceNumber && <CopyBtn text={order.referenceNumber} />}
            </div>
            {order && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {order.categoryName} · {order.gender === 'MEN' ? 'Men' : 'Women'} ·{' '}
                {new Date(order.createdAt).toLocaleString('en-NG', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {order && <StatusPill status={order.status} size="lg" />}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : !order ? null : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">

            {/* Customer */}
            <div className="px-5 py-4">
              <Section title="Customer">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
                  {order.whatsappNumber && (
                    <a
                      href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customerName}! This is regarding your ExploreAba custom order ${order.referenceNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                    >
                      <MessageCircle size={13} />
                      {order.whatsappNumber}
                    </a>
                  )}
                  {order.phoneNumber && order.phoneNumber !== order.whatsappNumber && (
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} /> {order.phoneNumber}
                    </p>
                  )}
                  {order.customerEmail && (
                    <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                      <Mail size={12} /> {order.customerEmail}
                    </a>
                  )}
                </div>
              </Section>
            </div>

            {/* Style & reference images */}
            <div className="px-5 py-4">
              <Section title="Style">
                {/* Gallery picker for admin — shows existing URLs + upload button */}
                <div className="space-y-3">
                  {order.style?.selectedStyleName && (
                    <p className="text-sm font-semibold text-slate-700">
                      Gallery pick: <span className="text-slate-900">{order.style.selectedStyleName}</span>
                    </p>
                  )}
                  {order.style?.styleNotes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      "{order.style.styleNotes}"
                    </p>
                  )}

                  {/* Reference image grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {(order.style?.referenceImageUrls || []).map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <ImageIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    ))}

                    {/* Upload slot — only show if fewer than 4 images */}
                    {(order.style?.referenceImageUrls || []).length < 4 && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 disabled:opacity-50"
                      >
                        {uploading
                          ? <Loader2 size={16} className="animate-spin" />
                          : <><Upload size={14} className="mb-1" /><span className="text-[9px] font-bold">Add</span></>}
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleImageUpload(e.target.files)}
                  />
                  <p className="text-[10px] text-slate-400">
                    Upload additional reference images (max 4 total). They go to Cloudinary immediately.
                  </p>
                </div>
              </Section>
            </div>

            {/* Size */}
            <div className="px-5 py-4">
              <Section title="Size">
                {order.size?.mode === 'TAILOR_VISIT' ? (
                  <p className="text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 font-medium">
                    🧵 Client requested a tailor visit — arrange in-person measuring.
                  </p>
                ) : order.size?.mode === 'CHART' ? (
                  <p className="text-sm font-bold text-slate-800">
                    Chart size: <span className="font-black text-slate-900">{order.size.chartSize}</span>
                    {order.size.profileName && <span className="text-xs text-slate-400 ml-2">({order.size.profileName})</span>}
                  </p>
                ) : (
                  <div>
                    {order.size?.profileName && (
                      <p className="text-xs text-slate-500 mb-2">Profile: <span className="font-semibold">{order.size.profileName}</span></p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      {Object.entries(order.size?.measurements || {}).filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-slate-500 capitalize">{k}</span>
                          <span className="font-bold text-slate-900 tabular-nums">{v}″</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Ruler size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400">Fitting: {order.details?.fitting}</span>
                    </div>
                  </div>
                )}
              </Section>
            </div>

            {/* Details */}
            {(order.details?.fabric || order.details?.color || order.details?.occasion || order.details?.needBy || order.details?.notes) && (
              <div className="px-5 py-4">
                <Section title="Details">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600">
                    {order.details.fabric   && <div>Fabric: <span className="font-semibold text-slate-800">{order.details.fabric}</span></div>}
                    {order.details.color    && <div>Color: <span className="font-semibold text-slate-800">{order.details.color}</span></div>}
                    {order.details.occasion && <div>Occasion: <span className="font-semibold text-slate-800">{order.details.occasion}</span></div>}
                    {order.details.needBy   && <div>Need by: <span className="font-semibold text-slate-800">{order.details.needBy}</span></div>}
                    {order.details.notes    && <div className="italic pt-1 border-t border-slate-200 mt-1">"{order.details.notes}"</div>}
                  </div>
                </Section>
              </div>
            )}

            {/* Delivery */}
            <div className="px-5 py-4">
              <Section title="Delivery">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      {order.delivery?.mode === 'ABA' ? 'Within Aba' : 'Nationwide delivery'}
                    </span>
                  </div>
                  {order.delivery?.address?.streetAddress && (
                    <div className="pl-5 text-slate-500 leading-relaxed">
                      {[order.delivery.address.streetAddress, order.delivery.address.city, order.delivery.address.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* Pricing */}
            {order.pricing?.quotedAmount && (
              <div className="px-5 py-4">
                <Section title="Pricing">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                    {[
                      { label: 'Quoted total',  val: order.pricing.quotedAmount  },
                      { label: 'Deposit (50%)', val: order.pricing.depositAmount },
                      { label: 'Balance',       val: order.pricing.balanceAmount },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 text-xs">
                        <span className="text-slate-500 font-medium">{row.label}</span>
                        <span className="font-black text-slate-900">₦{fmt(row.val)}</span>
                      </div>
                    ))}
                    <div className="flex gap-3 px-4 py-2.5 bg-white text-xs">
                      <span className={`font-bold px-2 py-0.5 rounded-full border ${order.pricing.depositPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        Deposit: {order.pricing.depositPaid ? '✓ Paid' : 'Pending'}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full border ${order.pricing.balancePaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        Balance: {order.pricing.balancePaid ? '✓ Paid' : 'Pending'}
                      </span>
                    </div>
                    {order.pricing.quoteNotes && (
                      <p className="px-4 pb-3 text-[11px] text-slate-500 italic">{order.pricing.quoteNotes}</p>
                    )}
                  </div>
                </Section>
              </div>
            )}

            {/* Status history */}
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

            {/* ── Quote form (SUBMITTED state) ── */}
            {needsQuote && !showCancel && (
              <div>
                {showQuote ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-3">
                    <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <DollarSign size={12} /> Apply quote — 50% deposit auto-computed
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">Total (₦) *</label>
                        <input
                          type="number"
                          value={quoteAmount}
                          onChange={e => setQuoteAmount(e.target.value)}
                          placeholder="e.g. 65000"
                          className="w-full text-sm font-bold border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                        />
                        {quoteAmount && parseFloat(quoteAmount) > 0 && (
                          <p className="text-[10px] text-blue-600 mt-1 font-semibold">
                            Deposit: ₦{fmt(Math.round(parseFloat(quoteAmount) * 50) / 100)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">Notes</label>
                        <input
                          type="text"
                          value={quoteNotes}
                          onChange={e => setQuoteNotes(e.target.value)}
                          placeholder="e.g. Cashmere fabric"
                          className="w-full text-sm border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowQuote(false); setQuoteAmount(''); setQuoteNotes(''); }}
                        className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyQuote}
                        disabled={updating || !quoteAmount || parseFloat(quoteAmount) <= 0}
                        className="flex-1 py-2 text-xs font-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {updating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Send Quote
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQuote(true)}
                    disabled={updating}
                    className="w-full py-2.5 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={13} /> Apply Quote
                  </button>
                )}
              </div>
            )}

            {/* ── Cancel form ── */}
            {showCancel && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Confirm cancellation
                </p>
                <textarea
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  placeholder="Reason (optional)"
                  rows={2}
                  className="w-full text-xs border border-red-200 rounded-lg px-3 py-2 resize-none outline-none focus:border-red-400 bg-white"
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowCancel(false); setCancelNote(''); }}
                    className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    Never mind
                  </button>
                  <button onClick={handleCancel} disabled={updating}
                    className="flex-1 py-2 text-xs font-black bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {updating ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* ── Status note field (shown when there are non-cancel transitions) ── */}
            {!showQuote && !showCancel && nonCancelNext.length > 0 && (
              <div>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Optional note for status update…"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 bg-slate-50 mb-2"
                />
              </div>
            )}

            {/* ── Action buttons ── */}
            {!showQuote && !showCancel && (
              <div className="flex flex-wrap gap-2">
                {nonCancelNext.map(status => {
                  const meta = STATUS_META[status] || { label: status, icon: Package };
                  const Icon = meta.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => advanceStatus(status)}
                      disabled={updating}
                      className="flex-1 min-w-[130px] py-2.5 px-3 text-xs font-black bg-slate-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {updating ? <Loader2 size={13} className="animate-spin" /> : <><Icon size={13} /> Mark {meta.label} <ArrowRight size={11} /></>}
                    </button>
                  );
                })}

                {canReject && (
                  <button
                    onClick={() => advanceStatus('REJECTED')}
                    disabled={updating}
                    className="py-2.5 px-3.5 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    disabled={updating}
                    className="py-2.5 px-3.5 text-xs font-bold border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}

                {nextAll.length === 0 && (
                  <p className="text-xs text-slate-400 font-medium py-2 w-full text-center">
                    This order is in a terminal state — no further transitions.
                  </p>
                )}
              </div>
            )}

            {/* ── WhatsApp shortcut ── */}
            {order.whatsappNumber && order.pricing?.quotedAmount && order.status === 'QUOTED' && (
              <a
                href={`https://wa.me/${order.whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent(
                  `Hello ${order.customerName}! Your ExploreAba custom ${order.categoryName} (ref: ${order.referenceNumber}) has been reviewed.\n\nYour quote: ₦${fmt(order.pricing.quotedAmount)}\nDeposit (50%): ₦${fmt(order.pricing.depositAmount)}\nBalance on delivery: ₦${fmt(order.pricing.balanceAmount)}\n\nReply to confirm and we will share the deposit payment link.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={13} />
                Send Quote via WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}