import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';

export function CartItem({ item, onUpdateQuantity, onRemove }) {
  const numericPrice = Number(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const itemTotal = (numericPrice * item.quantity).toFixed(2);

  return (
    <div className="flex space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-xl bg-white flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs flex-shrink-0">No image</div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">{item.title}</h3>
          <button
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.title} from cart`}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-indigo-600 font-bold text-sm">{item.price || '$0.00'}</div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Total: ${itemTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
