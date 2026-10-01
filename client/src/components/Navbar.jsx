import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smile, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md group-hover:scale-105 transition-transform">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">The Chuckle Canvas</h1>
            <p className="text-xs text-gray-500 font-medium">Headless WooCommerce Catalog</p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <nav className="hidden sm:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/products') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Products
            </Link>
          </nav>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart drawer"
            className="relative bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-3 rounded-2xl transition flex items-center space-x-2 shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs font-bold sm:inline hidden">Cart</span>
            {totalItems > 0 && (
              <span 
                data-testid="cart-badge"
                className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
