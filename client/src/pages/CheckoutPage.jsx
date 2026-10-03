import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OrderSummary } from '../components/OrderSummary';
import { ArrowLeft, Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If cart is empty, redirect user back to /products
  React.useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/products', { replace: true });
    }
  }, [items, navigate]);

  if (!items || items.length === 0) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const estimatedShipping = 5.00;
    const total = (subtotal + estimatedShipping).toFixed(2);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: formData,
          items: items.map(item => ({
            id: item.id,
            title: item.title || item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
          })),
          total
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to place order');
      }

      // Successful form submission: clear cart and redirect to confirmation
      clearCart();
      navigate(`/order-confirmation/${data.orderId}`, { state: { order: data, customer: formData, items, total } });
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while processing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back to Products */}
      <button
        onClick={() => navigate('/products')}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      <div className="text-center sm:text-left space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-gray-500 text-sm">Please provide your details below to finalize your purchase.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer Details Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shipping Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Apartment, City, State, ZIP"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-sm transition shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
