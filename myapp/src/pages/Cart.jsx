import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, RefreshCcw } from 'lucide-react';
import { api } from '../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCart = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.getCart();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const handleQuantityChange = async (item, delta) => {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity < 1) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await api.updateCartItem(item.id, nextQuantity);
      setItems(prevItems =>
        prevItems.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem
        )
      );
    } catch (err) {
      setError(err?.message || 'Unable to update quantity. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async itemId => {
    setActionLoading(true);
    setError('');
    try {
      await api.removeFromCart(itemId);
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err?.message || 'Unable to remove item. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await api.clearCart();
      setItems([]);
    } catch (err) {
      setError(err?.message || 'Unable to clear cart. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-6">
        <div className="max-w-5xl mx-auto py-20 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600 mt-1">{itemCount} item(s) in your cart</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadCart}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleClearCart}
              disabled={actionLoading || items.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <ShoppingCart size={30} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Browse products and add items to get started.</p>
            <Link
              to="/"
              className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="space-y-4">
                {items.map(item => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image_url || 'https://placehold.co/96x96?text=Product'}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">₹{Number(item.price).toFixed(2)} each</p>
                        {item.notes && <p className="text-xs text-gray-500 mt-2">Note: {item.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="inline-flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={actionLoading || item.quantity <= 1}
                          className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-10 px-3 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={actionLoading}
                          className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="min-w-24 text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-base font-bold text-gray-900">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Items ({itemCount})</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-700">Free</span>
                </div>
                <div className="my-3 border-t border-gray-200" />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-gray-900">Grand Total</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="mt-3 block text-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
