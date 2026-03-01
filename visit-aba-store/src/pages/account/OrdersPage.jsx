import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        // Now calling the paginated endpoint
        const response = await api.get('/v1/orders/my-orders');
        // Spring Page object returns the array inside "content"
        setOrders(response.data.content || []); 
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  // Helper for Status UI
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={14} />, text: 'Pending Payment' };
      case 'PAID':
      case 'PROCESSING':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Package size={14} />, text: 'Processing' };
      case 'SHIPPED':
        return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck size={14} />, text: 'Shipped' };
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={14} />, text: 'Delivered' };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={14} />, text: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Package size={14} />, text: status };
    }
  };

  if (loading || authLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-pulse flex flex-col items-center">
            <Package size={40} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">Loading your orders...</p>
         </div>
      </div>
  );

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
        </div>

        {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-6">
                    <Package size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-8">When you place an order, it will appear here.</p>
                <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                    Start Shopping
                </Link>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map((order) => {
                    const statusConfig = getStatusDisplay(order.orderStatus);
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    

                    return (
                        <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Order Placed</p>
                                    <p className="font-bold text-gray-900">{orderDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                    <p className="font-black text-blue-600">₦{order.totalAmount?.toLocaleString()}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Order Number</p>
                                    <p className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</p>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex-1">
                                    <div className={`inline-flex px-3 py-1.5 rounded-md border flex items-center gap-1.5 font-bold text-xs mb-3 ${statusConfig.color}`}>
                                        {statusConfig.icon} {statusConfig.text}
                                    </div>
                                    
                                    {/* Preview of items bought */}
                                    <div className="text-sm text-gray-600 line-clamp-2 pr-4">
                                        {order.itemNames && order.itemNames.join(", ")}
                                    </div>
                                </div>
                                
                                <button className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm w-full sm:w-auto whitespace-nowrap">
                                    View Details
                                </button>
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