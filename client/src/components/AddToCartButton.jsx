import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function AddToCartButton({ product, quantity = 1 }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 font-semibold px-8 py-4 rounded-2xl text-sm transition-all shadow-md active:scale-95 ${
        added
          ? 'bg-emerald-600 text-white shadow-emerald-200'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
      }`}
    >
      {added ? (
        <>
          <Check className="w-5 h-5 animate-bounce" />
          <span>Added to Cart ({quantity})</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
