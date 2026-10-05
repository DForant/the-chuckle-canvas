import React, { useState, useEffect } from 'react';
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
    address1: '',
    address2: '',
    state: '',
    city: '',
    zip: '',
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
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
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/products', { replace: true });
    }
  }, [items, navigate]);

  if (!items || items.length === 0) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // If sameAsShipping is checked, sync shipping fields to billing fields
      if (name === 'sameAsShipping' && checked) {
        updated.billingFirstName = updated.firstName;
        updated.billingLastName = updated.lastName;
        updated.billingAddress1 = updated.address1;
        updated.billingAddress2 = updated.address2;
        updated.billingCity = updated.city;
        updated.billingState = updated.state;
        updated.billingZip = updated.zip;
      } else if (updated.sameAsShipping) {
        // Automatically keep billing in sync with shipping if checkbox is checked
        if (['firstName', 'lastName', 'address1', 'address2', 'city', 'state', 'zip'].includes(name)) {
          updated.billingFirstName = name === 'firstName' ? value : updated.firstName;
          updated.billingLastName = name === 'lastName' ? value : updated.lastName;
          updated.billingAddress1 = name === 'address1' ? value : updated.address1;
          updated.billingAddress2 = name === 'address2' ? value : updated.address2;
          updated.billingCity = name === 'city' ? value : updated.city;
          updated.billingState = name === 'state' ? value : updated.state;
          updated.billingZip = name === 'zip' ? value : updated.zip;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const estimatedShipping = 5.00;
    const total = (subtotal + estimatedShipping).toFixed(2);

    const billing = formData.sameAsShipping
      ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      : {
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          address1: formData.billingAddress1,
          address2: formData.billingAddress2,
          city: formData.billingCity,
          state: formData.billingState,
          zip: formData.billingZip
        };

    const customerPayload = {
      firstName: formData.firstName,
      middleInitial: formData.middleInitial,
      lastName: formData.lastName,
      email: formData.email,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      address: `${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zip}`,
      name: `${formData.firstName} ${formData.middleInitial ? formData.middleInitial + '. ' : ''}${formData.lastName}`.trim()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: customerPayload,
          billingAddress: billing,
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
        })
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
          customer: customerPayload,
          billingAddress: billing,
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
        <p className="text-gray-500 text-sm">Please provide your personal, shipping, billing, and payment details below to finalize your purchase.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer & Payment Details Form */}
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
                    Middle Initial
                  </label>
                  <input
                    type="text"
                    id="middleInitial"
                    name="middleInitial"
                    maxLength="2"
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
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div>
                <label htmlFor="address1" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shipping Address 1
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  required
                  value={formData.address1}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shipping Address 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Comedy City"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="CC"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping Zip Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="12345"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Checkbox & Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60">
                <input
                  type="checkbox"
                  id="sameAsShipping"
                  name="sameAsShipping"
                  checked={formData.sameAsShipping}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition cursor-pointer"
                />
                <label htmlFor="sameAsShipping" className="text-sm font-semibold text-gray-800 cursor-pointer select-none">
                  Billing and Shipping address are the same
                </label>
              </div>

              {!formData.sameAsShipping && (
                <div className="space-y-4 p-5 bg-gray-50/40 rounded-3xl border border-gray-200/80 animate-fadeIn">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-200/60 pb-3">Billing Address</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingFirstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Billing First Name
                      </label>
                      <input
                        type="text"
                        id="billingFirstName"
                        name="billingFirstName"
                        required={!formData.sameAsShipping}
                        value={formData.billingFirstName}
                        onChange={handleChange}
                        placeholder="Jane"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingLastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Billing Last Name
                      </label>
                      <input
                        type="text"
                        id="billingLastName"
                        name="billingLastName"
                        required={!formData.sameAsShipping}
                        value={formData.billingLastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="billingAddress1" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Billing Address 1
                    </label>
                    <input
                      type="text"
                      id="billingAddress1"
                      name="billingAddress1"
                      required={!formData.sameAsShipping}
                      value={formData.billingAddress1}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingAddress2" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Billing Address 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="billingAddress2"
                      name="billingAddress2"
                      value={formData.billingAddress2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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
                        required={!formData.sameAsShipping}
                        value={formData.billingCity}
                        onChange={handleChange}
                        placeholder="Comedy City"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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
                        required={!formData.sameAsShipping}
                        value={formData.billingState}
                        onChange={handleChange}
                        placeholder="CC"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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
                        required={!formData.sameAsShipping}
                        value={formData.billingZip}
                        onChange={handleChange}
                        placeholder="12345"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="space-y-4 pt-2">
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
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="cvcCode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    CVC Code
                  </label>
                  <input
                    type="text"
                    id="cvcCode"
                    name="cvcCode"
                    required
                    maxLength="4"
                    value={formData.cvcCode}
                    onChange={handleChange}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order</span>
                </>
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
