import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { Navbar } from './components/Navbar';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
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
