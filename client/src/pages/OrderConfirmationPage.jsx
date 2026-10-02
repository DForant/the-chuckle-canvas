import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Mail, User, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const stateData = location.state || {};

  const order = stateData.order || { orderId: orderId || 'CHK-UNKNOWN', timestamp: new Date().toISOString(), status: 'received' };
  const customer = stateData.customer || { name: 'Valued Customer', email: 'customer@example.com', address: '123 Main St' };
  const items = stateData.items || [];
  const total = stateData.total || '0.00';

  const subtotal = items.reduce((sum, item) => {
    const price = Number(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = items.length > 0 ? 5.00 : 0.00;
  const calculatedTotal = total !== '0.00' ? total : (subtotal + shipping).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-indigo-100/50 border border-gray-100 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-gray-500 text-sm">Thank you for your purchase. We have received your order.</p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-indigo-50/80 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-2xl text-sm font-bold">
          <span>Order ID:</span>
          <span className="font-mono tracking-wider">{order.orderId || orderId}</span>
        </div>
      </div>

      {/* Customer & Order Details Receipt */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 border border-gray-100 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Customer Receipt Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer Name</span>
            </div>
            <p className="text-gray-900 font-medium pl-6">{customer.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Email Address</span>
            </div>
            <p className="text-gray-900 font-medium pl-6">{customer.email}</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center space-x-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Shipping Address</span>
            </div>
            <p className="text-gray-900 font-medium pl-6 whitespace-pre-line">{customer.address}</p>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div className="flex items-center space-x-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Items Purchased</span>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map(item => {
              const numericPrice = Number(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
              const itemTotal = numericPrice * item.quantity;
              return (
                <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title || item.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs">
                        {item.quantity}x
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title || item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated Shipping</span>
            <span className="font-semibold text-gray-900">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
            <span>Total Paid</span>
            <span className="text-indigo-600 text-lg">${calculatedTotal}</span>
          </div>
        </div>
      </div>

      {/* Continue Shopping Action */}
      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-sm transition shadow-lg shadow-indigo-200"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
