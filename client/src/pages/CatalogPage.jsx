import React, { useState, useEffect } from 'react';
import { Smile, RefreshCw, Sparkles, Search } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { fetchProductsApi } from '../services/api';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsApi();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError('Failed to load product catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md group-hover:bg-indigo-700 transition">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">The Chuckle Canvas</h1>
                <p className="text-xs text-gray-500">Accessible & Responsive Canvas Catalog</p>
              </div>
            </a>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="/" className="text-indigo-600 hover:text-indigo-800 transition">Catalog</a>
            <a href="/products" className="text-gray-600 hover:text-gray-900 transition">Products</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
            <Sparkles className="w-72 h-72" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3.5 py-1 rounded-full mb-4 backdrop-blur">
              Catalog MVP
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Explore Our Chuckling Canvas Collection
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6">
              Handcrafted high-resolution art prints and premium wrapped canvases guaranteed to bring warmth, humor, and joy into every space.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadProducts}
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 font-semibold px-5 py-3 rounded-xl shadow-md hover:bg-indigo-50 transition transform active:scale-95 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh Catalog'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search canvases by title or description..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={loadProducts}
              className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-16 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} The Chuckle Canvas. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="/" className="hover:text-gray-900 transition">Privacy Policy</a>
            <a href="/" className="hover:text-gray-900 transition">Terms of Service</a>
            <a href="/" className="hover:text-gray-900 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
