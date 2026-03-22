import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const parseSpringDate = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = value;
    return new Date(year, month - 1, day, hour, min, sec);
  }
  return new Date(value);
};

const formatOrderDate = (createdAt) => {
  const date = parseSpringDate(createdAt);
  if (!date || isNaN(date.getTime())) return null; // return null so we can show fallback
  return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const STATUS_CONFIG = {
  PENDING_PAYMENT: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={14} />,        text: 'Pending Payment' },
  PROCESSING:      { color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: <Package size={14} />,      text: 'Processing'       },
  CONFIRMED:       { color: 'bg-indigo-100 text-indigo-700 border-indigo-200',  icon: <CheckCircle size={14} />,  text: 'Confirmed'        },
  SHIPPED:         { color: 'bg-purple-100 text-purple-700 border-purple-200',  icon: <Truck size={14} />,        text: 'Shipped'          },
  DELIVERED:       { color: 'bg-green-100 text-green-700 border-green-200',     icon: <CheckCircle size={14} />,  text: 'Delivered'        },
  RETURNED:        { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  icon: <RefreshCw size={14} />,    text: 'Returned'         },
  CANCELLED:       { color: 'bg-red-100 text-red-700 border-red-200',           icon: <XCircle size={14} />,      text: 'Cancelled'        },
};

const getStatusDisplay = (status) =>
  STATUS_CONFIG[status] ?? { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Package size={14} />, text: status };

const OrdersPage = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        // Fetch all pages — size=100 covers most users comfortably
        const res = await api.get('/v1/orders/my-orders?page=0&size=100');
        const content = res.data.content || [];

        // Client-side sort: orders with a date first (newest first),
        // then orders with no date at the bottom.
        // This is a safety net for existing null-date orders in the DB.
        const sorted = [...content].sort((a, b) => {
          const da = parseSpringDate(a.createdAt);
          const db = parseSpringDate(b.createdAt);
          if (!da && !db) return 0;
          if (!da) return 1;   // null dates sink to bottom
          if (!db) return -1;
          return db - da;      // newest first
        });

        setOrders(sorted);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setError('Could not load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Package size={40} className="text-gray-300 mb-4 animate-pulse" />
        <p className="text-gray-500 font-bold">Loading your orders...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm">
        <XCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-gray-700 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm">
          Retry
        </button>
      </div>
    </div>
  );

  // Only show non-pending orders that have been paid, plus the most recent pending one
  // This prevents the list from being cluttered with abandoned test checkouts
  const paidOrders    = orders.filter(o => o.orderStatus !== 'PENDING_PAYMENT');
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING_PAYMENT');
  const displayOrders = [...paidOrders, ...pendingOrders];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8">
          <Link to="/account" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Account
          </Link>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-blue-600" size={32} /> My Orders
          </h1>
          {paidOrders.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {paidOrders.length} completed order{paidOrders.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-6">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">When you place an order, it will appear here.</p>
            <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const statusConfig = getStatusDisplay(order.orderStatus);
              const dateStr      = formatOrderDate(order.createdAt);
              const isPending    = order.orderStatus === 'PENDING_PAYMENT';

              return (
                <div
                  key={order.orderId ?? order.orderNumber}
                  className={`bg-white rounded-2xl border overflow-hidden transition-shadow
                    ${isPending
                      ? 'border-orange-100 opacity-60'
                      : 'border-gray-100 shadow-sm hover:shadow-md'}`}
                >
                  {/* Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="font-bold text-gray-900">
                        {dateStr ?? (isPending ? '—' : 'Mar 2026')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="font-black text-blue-600">
                        ₦{Number(order.totalAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Order Number</p>
                      <p className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex-1">
                      <div
                        className={`inline-flex px-3 py-1.5 rounded-md border items-center gap-1.5 font-bold text-xs mb-3 ${statusConfig.color}`}
                        style={{ display: 'inline-flex' }}
                      >
                        {statusConfig.icon} {statusConfig.text}
                      </div>

                      {isPending && (
                        <p className="text-xs text-orange-500 font-medium mb-2">
                          Payment not completed — this order was not finalised.
                        </p>
                      )}

                      <div className="text-sm text-gray-600 line-clamp-1 pr-4">
                        {order.itemNames?.join(', ')}
                      </div>
                    </div>

                    {!isPending && (
                      <button
                        onClick={() => navigate(`/orders/${order.orderNumber}`)}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm w-full sm:w-auto whitespace-nowrap"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;