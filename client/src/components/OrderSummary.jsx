import React from 'react';
import { useCart } from '../context/CartContext';

export function OrderSummary() {
  const { items, subtotal } = useCart();
  const estimatedShipping = items.length > 0 ? 5.00 : 0.00;
  const total = subtotal + estimatedShipping;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 border border-gray-100 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto space-y-4 pr-2">
        {items.map(item => {
          const numericPrice = Number(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
          const itemTotal = numericPrice * item.quantity;
          return (
            <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title || item.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm">
                    {item.quantity}x
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title || item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-sm">${itemTotal.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Estimated Shipping</span>
          <span className="font-semibold text-gray-900">${estimatedShipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
          <span>Total</span>
          <span className="text-indigo-600 text-lg" data-testid="checkout-total">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
