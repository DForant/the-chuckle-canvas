import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/ProductGrid';
import { Sparkles, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { fetchProducts } from '../services/api';

// Fallback mock products in case CMS gateway is unreachable during dev
const FALLBACK_PRODUCTS = [
  {
    id: 'prod-fallback-1',
    title: 'Laughing Mona Lisa Canvas',
    slug: 'laughing-mona-lisa',
    price: '$49.99',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=600',
    description: 'Classic masterpiece infused with an infectious smile.'
  },
  {
    id: 'prod-fallback-2',
    title: 'Silly Pug in Space Canvas',
    slug: 'silly-pug-in-space',
    price: '$39.99',
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600',
    description: 'An astronaut pug floating through a galaxy of chuckles.'
  },
  {
    id: 'prod-fallback-3',
    title: 'Melting Clock Humor Art',
    slug: 'melting-clock-humor',
    price: '$45.00',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600',
    description: 'Time flies when you are having fun and laughing.'
  },
  {
    id: 'prod-fallback-4',
    title: 'Abstract Joy Splash Canvas',
    slug: 'abstract-joy-splash',
    price: '$55.99',
    imageUrl: 'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=600',
    description: 'Vibrant colors exploding with pure comedic delight.'
  }
];

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      if (data && data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.warn('Gateway unavailable, using fallback mock catalog:', err);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredProducts = products.filter(p =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-15 pointer-events-none">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-md">
            ✨ WPGraphQL WooCommerce Gateway
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            The Chuckle Canvas Catalog
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6">
            Explore our curated collection of humorous masterpieces and high-quality canvases designed to spark joy and laughter in every room.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadCatalog}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-2xl shadow-md hover:bg-indigo-50 transition transform active:scale-95 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading Catalog...' : 'Refresh Catalog'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search canvases..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> canvases
        </div>
      </div>

      {/* Loading & Grid State */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
