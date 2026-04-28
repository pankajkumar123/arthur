import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  IndianRupee,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrderDetails = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.getOrder(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white p-6">
        <div className="max-w-5xl mx-auto py-20 flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-purple-600 animate-spin" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white p-6">
        <div className="max-w-5xl mx-auto py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status] || Clock;
  const statusColor = statusColors[order.status] || statusColors.pending;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>

        {/* Order Header */}
        <header className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Calendar size={16} />
                <span>Placed on {formatDate(order.created_at)}</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold uppercase ${statusColor}`}
            >
              <StatusIcon size={18} />
              {order.status}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product_name || item.name || 'Product'}</h3>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{Number(item.unit_price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">per unit</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items found</p>
              )}
            </div>
          </section>

          {/* Delivery & Payment Info */}
          <aside className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Delivery Address
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{order.delivery_address}</p>
                <p>{order.city}, {order.state}</p>
                <p>{order.pincode}</p>
                {order.phone && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Phone size={14} />
                    <span>{order.phone}</span>
                  </div>
                )}
                {order.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{order.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IndianRupee size={18} />
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{Number(order.gst_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{Number(order.shipping_cost || 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-lg">₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {order.payment_method && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 uppercase mt-1">
                    {order.payment_method}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
