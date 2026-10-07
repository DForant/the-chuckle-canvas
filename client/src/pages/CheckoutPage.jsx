import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OrderSummary } from '../components/OrderSummary';
import { ArrowLeft, Lock, Loader2, CreditCard, MapPin, User } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    billingSameAsShipping: true,
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    cardNumber: '',
    expirationDate: '',
    cvcCode: ''
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const estimatedShipping = 5.00;
    const total = (subtotal + estimatedShipping).toFixed(2);

    const payload = {
      customer: {
        firstName: formData.firstName,
        middleInitial: formData.middleInitial,
        lastName: formData.lastName,
        email: formData.email,
        shippingAddress1: formData.shippingAddress1,
        shippingAddress2: formData.shippingAddress2,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingZip: formData.shippingZip,
        billingSameAsShipping: formData.billingSameAsShipping,
        billingAddress1: formData.billingSameAsShipping ? formData.shippingAddress1 : formData.billingAddress1,
        billingAddress2: formData.billingSameAsShipping ? formData.shippingAddress2 : formData.billingAddress2,
        billingCity: formData.billingSameAsShipping ? formData.shippingCity : formData.billingCity,
        billingState: formData.billingSameAsShipping ? formData.shippingState : formData.billingState,
        billingZip: formData.billingSameAsShipping ? formData.shippingZip : formData.billingZip
      },
      payment: {
        cardNumber: formData.cardNumber,
        expirationDate: formData.expirationDate,
        cvcCode: formData.cvcCode
      },
      items: items.map(item => ({
        id: item.id,
        title: item.title || item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      total
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to place order');
      }

      // Successful form submission: clear cart and redirect to confirmation
      clearCart();
      navigate(`/order-confirmation/${data.orderId}`, {
        state: {
          order: data,
          customer: payload.customer,
          payment: { cardNumber: formData.cardNumber.slice(-4) },
          items,
          total
        }
      });
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
        <p className="text-gray-500 text-sm">Please complete your information below to place your order.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="middleInitial" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Middle
                  </label>
                  <input
                    type="text"
                    id="middleInitial"
                    name="middleInitial"
                    maxLength="1"
                    value={formData.middleInitial}
                    onChange={handleChange}
                    placeholder="M"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
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
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div>
                <label htmlFor="shippingAddress1" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shipping Address 1
                </label>
                <input
                  type="text"
                  id="shippingAddress1"
                  name="shippingAddress1"
                  required
                  value={formData.shippingAddress1}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label htmlFor="shippingAddress2" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shipping Address 2 <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="shippingAddress2"
                  name="shippingAddress2"
                  value={formData.shippingAddress2}
                  onChange={handleChange}
                  placeholder="Apt, Suite, Unit, etc."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="shippingCity" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping City
                  </label>
                  <input
                    type="text"
                    id="shippingCity"
                    name="shippingCity"
                    required
                    value={formData.shippingCity}
                    onChange={handleChange}
                    placeholder="Comedy City"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="shippingState" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping State
                  </label>
                  <input
                    type="text"
                    id="shippingState"
                    name="shippingState"
                    required
                    value={formData.shippingState}
                    onChange={handleChange}
                    placeholder="CC"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="shippingZip" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping Zip code
                  </label>
                  <input
                    type="text"
                    id="shippingZip"
                    name="shippingZip"
                    required
                    value={formData.shippingZip}
                    onChange={handleChange}
                    placeholder="12345"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Billing Checkbox */}
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="billingSameAsShipping"
                name="billingSameAsShipping"
                checked={formData.billingSameAsShipping}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500"
              />
              <label htmlFor="billingSameAsShipping" className="text-sm font-semibold text-gray-800 cursor-pointer">
                Billing and Shipping address are the same
              </label>
            </div>

            {/* Billing Address (conditional) */}
            {!formData.billingSameAsShipping && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Billing Address</h2>
                </div>

                <div>
                  <label htmlFor="billingAddress1" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Billing Address 1
                  </label>
                  <input
                    type="text"
                    id="billingAddress1"
                    name="billingAddress1"
                    required={!formData.billingSameAsShipping}
                    value={formData.billingAddress1}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="billingAddress2" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Billing Address 2 <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="billingAddress2"
                    name="billingAddress2"
                    value={formData.billingAddress2}
                    onChange={handleChange}
                    placeholder="Apt, Suite, Unit, etc."
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="billingCity" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Billing City
                    </label>
                    <input
                      type="text"
                      id="billingCity"
                      name="billingCity"
                      required={!formData.billingSameAsShipping}
                      value={formData.billingCity}
                      onChange={handleChange}
                      placeholder="Comedy City"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingState" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Billing State
                    </label>
                    <input
                      type="text"
                      id="billingState"
                      name="billingState"
                      required={!formData.billingSameAsShipping}
                      value={formData.billingState}
                      onChange={handleChange}
                      placeholder="CC"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingZip" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Billing Zip
                    </label>
                    <input
                      type="text"
                      id="billingZip"
                      name="billingZip"
                      required={!formData.billingSameAsShipping}
                      value={formData.billingZip}
                      onChange={handleChange}
                      placeholder="12345"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Credit Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  required
                  maxLength="19"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    id="expirationDate"
                    name="expirationDate"
                    required
                    maxLength="5"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                  />
                </div>

                <div>
                  <label htmlFor="cvcCode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    CVC Code
                  </label>
                  <input
                    type="password"
                    id="cvcCode"
                    name="cvcCode"
                    required
                    maxLength="4"
                    value={formData.cvcCode}
                    onChange={handleChange}
                    placeholder="CVC"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                  />
                </div>
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
