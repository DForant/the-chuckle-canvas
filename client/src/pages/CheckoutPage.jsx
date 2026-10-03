import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, clearCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order processing and generate a realistic Order ID
    setTimeout(() => {
      const orderId = 'CHK-' + Math.floor(100000 + Math.random() * 900000);
      const orderDetails = {
        orderId,
        date: new Date().toLocaleString(),
        items: [...items],
        subtotal,
        shipping: subtotal > 50 ? 0 : 5.99,
        total: subtotal + (subtotal > 50 ? 0 : 5.99),
        customer: { ...formData }
      };

      setOrderResult(orderDetails);
      setIsSubmitting(false);
      clearCart();
    }, 1000);
  };

  if (orderResult) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4" data-testid="order-confirmation-page">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
              Order Placed Successfully
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">Thank You for Your Order!</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              We have received your order and are getting your canvases ready to bring laughs to your door.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/60 gap-2">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order Reference ID</p>
                <p className="text-lg font-bold text-indigo-600 font-mono" data-testid="receipt-order-id">{orderResult.orderId}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order Date</p>
                <p className="text-sm font-medium text-gray-700">{orderResult.date}</p>
              </div>
            </div>

            {/* Receipt Items */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Details / Receipt</h3>
              <div className="space-y-3">
                {orderResult.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-none">
                    <div className="flex items-center space-x-3">
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-gray-200" />
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(Number(String(item.price || '0').replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200/60 text-xs">
              <div>
                <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Shipping Address</p>
                <p className="text-gray-600">{orderResult.customer.firstName} {orderResult.customer.lastName}</p>
                <p className="text-gray-600">{orderResult.customer.address}</p>
                <p className="text-gray-600">{orderResult.customer.city}, {orderResult.customer.postalCode}</p>
                <p className="text-gray-600">{orderResult.customer.country}</p>
              </div>
              <div>
                <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Email</p>
                <p className="text-gray-600">{orderResult.customer.email}</p>
                <p className="font-bold text-gray-700 uppercase tracking-wider mt-3 mb-1">Payment Method</p>
                <p className="text-gray-600">Credit Card ending in {orderResult.customer.cardNumber.slice(-4) || '••••'}</p>
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${orderResult.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{orderResult.shipping === 0 ? 'FREE' : `$${orderResult.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span className="text-indigo-600" data-testid="receipt-total">${orderResult.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition shadow-md shadow-indigo-200 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500 text-sm">Add some laughter to your cart before proceeding to checkout.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition shadow-md shadow-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center space-x-4">
        <Link
          to="/products"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white transition shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>1. Contact & Shipping Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Chuckle Way"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Comedy City"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="90210"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>2. Payment Details</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Card Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="4532 •••• •••• ••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Expiration Date</label>
                  <input
                    type="text"
                    name="expDate"
                    required
                    maxLength="5"
                    value={formData.expDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    required
                    maxLength="4"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">Order Summary ({items.reduce((acc, item) => acc + item.quantity, 0)})</h2>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  <img src={item.imageUrl} alt={item.title} className="w-14 h-14 object-cover rounded-2xl border border-gray-100 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                  ${(Number(String(item.price || '0').replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900">{subtotal > 50 ? 'FREE' : '$5.99'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-indigo-600">${(subtotal + (subtotal > 50 ? 0 : 5.99)).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Secure 256-bit SSL encrypted checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Free shipping on orders over $50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
