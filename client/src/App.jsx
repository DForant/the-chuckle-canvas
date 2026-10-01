import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { CartProvider, useCart } from './context/CartContext';
import { Smile, ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';

function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart ({totalItems})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Your cart is currently empty.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-xl bg-white flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs flex-shrink-0">No image</div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">{item.title}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-indigo-600 font-bold text-sm">{item.price || '$0.00'}</div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        Total: ${(Number(String(item.price || '0').replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout placeholder */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-gray-900">
                <span>Subtotal</span>
                <span className="text-indigo-600">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
              <button
                onClick={() => alert('Checkout is intentionally excluded per prompt constraints.')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-sm transition shadow-md shadow-indigo-200"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Navigation() {
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
            className="relative bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-3 rounded-2xl transition flex items-center space-x-2 shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs font-bold sm:inline hidden">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 flex flex-col font-sans">
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
            </Routes>
          </main>
          <CartDrawer />
          <footer className="bg-white border-t border-gray-100 py-8 mt-16 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} The Chuckle Canvas. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}
