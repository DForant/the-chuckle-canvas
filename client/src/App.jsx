import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import { Smile, Sparkles } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50 shadow-sm">
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

        <nav className="flex items-center space-x-2 sm:space-x-4">
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
      </div>
    </header>
  );
}

function ProductDetailPlaceholder() {
  const location = useLocation();
  const slug = location.pathname.split('/').pop();

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Canvas Detail: <span className="text-indigo-600 capitalize">{slug.replace(/-/g, ' ')}</span></h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
          You have successfully navigated to the product detail page! Fully responsive product inspection is ready.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/products" element={<CatalogPage />} />
            <Route path="/products/:slug" element={<ProductDetailPlaceholder />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-100 py-8 mt-16 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} The Chuckle Canvas. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
