import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[data-razorpay="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay',
  });

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getCart();
        const cartItems = Array.isArray(response.data) ? response.data : [];
        setItems(cartItems);
      } catch (err) {
        setError(err?.message || 'Failed to load cart for checkout.');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [items]);

  const gst = useMemo(() => Math.round(subtotal * 0.18 * 100) / 100, [subtotal]);
  const shipping = useMemo(() => (subtotal > 5000 ? 0 : items.length > 0 ? 100 : 0), [items.length, subtotal]);
  const grandTotal = subtotal + gst + shipping;

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const verifyPayment = async (response, orderId) => {
    await api.verifyPayment({
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
      orderId,
    });
  };

  const launchRazorpay = async orderResponse => {
    const paymentResponse = await api.createPayment({ orderId: orderResponse.orderId });
    const paymentData = paymentResponse.data;

    await loadRazorpayScript();

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Sai Scientifics',
        description: `Order ${paymentData.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        handler: async response => {
          try {
            await verifyPayment(response, orderResponse.orderId);
            resolve(orderResponse.orderId);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment window closed before completion.')),
        },
        prefill: {
          email: paymentData.customerEmail,
        },
        theme: {
          color: '#2563eb',
        },
      });

      razorpay.open();
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (items.length === 0) {
      setError('Your cart is empty. Add items before checkout.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderResponse = await api.createOrder(formData);

      if (formData.paymentMethod === 'razorpay') {
        const orderId = await launchRazorpay(orderResponse.data);
        navigate(`/orders/${orderId}`);
        return;
      }

      navigate(`/orders/${orderResponse.data.orderId}`);
    } catch (err) {
      setError(err?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-6">
        <div className="max-w-5xl mx-auto py-20 flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Checkout</h1>
          <p className="text-gray-600 mb-6">Your cart is empty, so there is nothing to checkout yet.</p>
          <Link
            to="/cart"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Cart
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your order and pay securely.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-medium text-gray-700">
                  Address Line
                  <input
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="House no, street, area"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  City
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="City"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  State
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="State"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Pincode
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{6}"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="6-digit pincode"
                  />
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                Payment Method
              </h2>
              <div className="grid gap-3">
                <label className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={formData.paymentMethod === 'razorpay'}
                    onChange={handleChange}
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Pay Online with Razorpay</span>
                    <span className="block text-sm text-gray-600">Cards, UPI, NetBanking, Wallets</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                    <span className="block text-sm text-gray-600">Use this for domestic manual order fulfilment</span>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {submitting ? 'Processing...' : formData.paymentMethod === 'razorpay' ? 'Pay Securely' : 'Place Order'}
            </button>
          </form>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Order Summary</h2>
          <div className="space-y-3 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-500">Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="my-5 border-t border-gray-200" />

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium text-gray-900">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-base">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;