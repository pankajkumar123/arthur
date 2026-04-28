import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, FileText, ShoppingCart, Sparkles, Loader2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getProducts({ limit: 10 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await api.addToCart({ product_id: productId, quantity: 1 });
      // You could add a success toast here
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You could add an error toast here
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 shadow-sm">
            <Sparkles size={32} className="text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Welcome to Sai Scientifics
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your trusted partner for industrial supplies, laboratory equipment, and scientific instruments
          </p>
        </header>

        {/* User Welcome Card */}
        {isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <p className="text-gray-900 font-medium">
              👋 Welcome back, <span className="font-semibold">{user?.full_name || user?.fullName || 'User'}</span>!
            </p>
            <p className="text-sm text-gray-600 mt-1">Ready to explore products or track your orders?</p>
          </div>
        )}

        {/* Quick Actions */}
        <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">My Cart</p>
              <p className="text-xs text-gray-500">View cart items</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-purple-300 transition-all group"
          >
            <div className="rounded-lg bg-purple-100 p-3 group-hover:bg-purple-200 transition-colors">
              <ShoppingBag size={24} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">My Orders</p>
              <p className="text-xs text-gray-500">Track orders</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/rfq')}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="rounded-lg bg-indigo-100 p-3 group-hover:bg-indigo-200 transition-colors">
              <FileText size={24} className="text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Get Quote</p>
              <p className="text-xs text-gray-500">Request pricing</p>
            </div>
          </button>
        </section>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse Products</h2>
            <Button onClick={loadProducts} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load Products'
              )}
            </Button>
          </div>

          {products.length === 0 && !loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <ShoppingBag size={30} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No products loaded yet</p>
              <Button onClick={loadProducts}>Load Products</Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <article
                key={product.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description || 'Quality product for your needs'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{Number(product.price ?? product.base_price ?? 0).toFixed(2)}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart[product.id]}
                  >
                    {addingToCart[product.id] ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="mr-1" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
