import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { ProductGrid } from './components/ProductGrid';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getProducts()
      .then(data => {
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : data.products || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewDetails = async (slug) => {
    try {
      const product = await api.getProductBySlug(slug);
      setSelectedProduct(product);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white font-bold p-2.5 rounded-xl shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">The Chuckle Canvas</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Curated Art Catalog</p>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600 hidden sm:block">
            {products.length} {products.length === 1 ? 'Masterpiece' : 'Masterpieces'} available
          </div>
        </div>
      </header>

      {/* Main Catalog Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Explore Collection</h2>
          <p className="text-gray-600 mt-1">Discover unique canvases tailored to brighten your space.</p>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onViewDetails={handleViewDetails}
        />
      </main>

      {/* Selected Product Quick Modal / Banner */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.title}</h3>
            <p className="text-indigo-600 font-bold text-xl mb-4">${selectedProduct.price}</p>
            <p className="text-gray-600 mb-6">{selectedProduct.description || 'No description available for this exquisite piece.'}</p>
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} The Chuckle Canvas. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
