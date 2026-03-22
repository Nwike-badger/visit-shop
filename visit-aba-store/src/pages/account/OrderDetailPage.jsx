import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, CreditCard, Clock,
  CheckCircle, Truck, XCircle, RefreshCw, ShoppingBag,
  Receipt, AlertCircle
} from 'lucide-react';
import api from '../../api/axiosConfig';

// ── Date parsing (same as OrdersPage) ────────────────────────────────────────
const parseSpringDate = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = value;
    return new Date(year, month - 1, day, hour, min, sec);
  }
  return new Date(value);
};

const formatDate = (value, opts = {}) => {
  const date = parseSpringDate(value);
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    ...opts,
  });
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING_PAYMENT: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={15} />,        text: 'Pending Payment',  step: 0 },
  PROCESSING:      { color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: <Package size={15} />,      text: 'Processing',       step: 1 },
  CONFIRMED:       { color: 'bg-indigo-100 text-indigo-700 border-indigo-200',  icon: <CheckCircle size={15} />,  text: 'Confirmed',        step: 2 },
  SHIPPED:         { color: 'bg-purple-100 text-purple-700 border-purple-200',  icon: <Truck size={15} />,        text: 'Shipped',          step: 3 },
  DELIVERED:       { color: 'bg-green-100 text-green-700 border-green-200',     icon: <CheckCircle size={15} />,  text: 'Delivered',        step: 4 },
  RETURNED:        { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  icon: <RefreshCw size={15} />,    text: 'Returned',         step: -1 },
  CANCELLED:       { color: 'bg-red-100 text-red-700 border-red-200',           icon: <XCircle size={15} />,      text: 'Cancelled',        step: -1 },
};

const PAYMENT_STATUS = {
  PENDING: { color: 'text-orange-600', text: 'Awaiting Payment' },
  SUCCESS: { color: 'text-green-600',  text: 'Paid'             },
  FAILED:  { color: 'text-red-600',    text: 'Failed'           },
};

// ── Progress tracker steps ────────────────────────────────────────────────────
const STEPS = ['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'];

const ProgressBar = ({ currentStatus }) => {
  const config     = STATUS_CONFIG[currentStatus];
  const currentStep = config?.step ?? 0;
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'RETURNED';

  if (isCancelled) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Order Progress</h3>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-green-500 z-0 transition-all duration-700"
          style={{ width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }}
        />

        {STEPS.map((label, i) => {
          const done    = i < currentStep;
          const active  = i === currentStep;
          return (
            <div key={label} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${done   ? 'bg-green-500 border-green-500 text-white'
                : active ? 'bg-white border-blue-600 text-blue-600'
                :          'bg-white border-gray-200 text-gray-300'}`}
              >
                {done ? <CheckCircle size={16} fill="white" stroke="white" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <p className={`text-[10px] font-bold mt-2 text-center leading-tight max-w-[60px]
                ${done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate        = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/v1/orders/${orderNumber}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
        setError(err.response?.status === 404
          ? 'Order not found.'
          : 'Could not load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Package size={40} className="text-gray-300 mb-4 animate-pulse" />
        <p className="text-gray-500 font-bold">Loading order details...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-gray-700 font-bold mb-6">{error ?? 'Order not found'}</p>
        <Link to="/orders" className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm">
          Back to Orders
        </Link>
      </div>
    </div>
  );

  const statusConfig  = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.PROCESSING;
  const paymentConfig = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.PENDING;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">

        {/* ── Back + Header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt, { hour: undefined, minute: undefined })}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.text}
            </div>
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        <ProgressBar currentStatus={order.orderStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Items + History ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBag size={16} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">Order Items</h3>
                <span className="ml-auto text-xs text-gray-400">{order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items?.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-start gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                      }
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-tight">{item.productName}</p>
                      {item.sku && <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.sku}</p>}

                      {/* Variant attributes */}
                      {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(item.variantAttributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900 text-sm">
                        ₦{Number(item.subTotal ?? (item.unitPrice * item.quantity) ?? 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ₦{Number(item.unitPrice ?? 0).toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <h3 className="font-bold text-gray-900">Order Timeline</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {[...order.statusHistory].reverse().map((h, i) => {
                    const cfg = STATUS_CONFIG[h.status];
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${cfg?.color ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {cfg?.icon ?? <Package size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{cfg?.text ?? h.status}</p>
                          {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                        </div>
                        <p className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(h.timestamp)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary sidebar ──────────────────────────────────── */}
          <div className="space-y-6">

            {/* Payment summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Receipt size={16} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">Payment</h3>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{Number(order.itemSubTotal ?? 0).toLocaleString()}</span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (7.5%)</span>
                    <span>₦{Number(order.taxAmount).toLocaleString()}</span>
                  </div>
                )}
                {Number(order.shippingFee) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₦{Number(order.shippingFee).toLocaleString()}</span>
                  </div>
                )}
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−₦{Number(order.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <span>₦{Number(order.totalAmount ?? order.grandTotal ?? 0).toLocaleString()}</span>
                </div>
                <div className="pt-1 flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Payment status</span>
                  <span className={`text-xs font-bold ${paymentConfig.color}`}>{paymentConfig.text}</span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Method</span>
                    <span className="text-xs font-bold text-gray-700 uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                )}
                {order.paymentReference && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Reference</p>
                    <p className="text-xs font-mono text-gray-700 break-all">{order.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <h3 className="font-bold text-gray-900">Delivery Address</h3>
                </div>
                <div className="px-6 py-4 text-sm text-gray-600 space-y-1">
                  {order.shippingAddress.phoneNumber && (
                    <p className="font-bold text-gray-900">{order.shippingAddress.phoneNumber}</p>
                  )}
                  <p>{order.shippingAddress.streetAddress}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Tracking info */}
            {(order.courierName || order.trackingNumber) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Truck size={16} className="text-gray-500" />
                  <h3 className="font-bold text-gray-900">Tracking</h3>
                </div>
                <div className="px-6 py-4 text-sm space-y-2">
                  {order.courierName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Courier</span>
                      <span className="font-bold text-gray-900">{order.courierName}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking #</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                       className="block mt-2 text-center text-xs font-bold text-blue-600 hover:underline">
                      Track Package →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Need help */}
            <div className="bg-gray-900 rounded-2xl p-5 text-white text-center">
              <CreditCard size={24} className="mx-auto mb-3 text-gray-400" />
              <p className="font-bold text-sm mb-1">Need help?</p>
              <p className="text-xs text-gray-400 mb-3">Questions about your order?</p>
              <a href="mailto:support@exploreaba.ng"
                 className="text-xs font-bold text-green-400 hover:text-green-300">
                support@exploreaba.ng
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;