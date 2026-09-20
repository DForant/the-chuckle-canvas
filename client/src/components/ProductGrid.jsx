import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products = [], loading = false, error = null, onViewDetails }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading masterpieces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center my-8 max-w-xl mx-auto">
        <p className="font-semibold">Unable to load products</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 my-8">
        <p className="text-gray-500 text-lg font-medium">No canvas artworks found in the catalog.</p>
        <p className="text-gray-400 text-sm mt-1">Check back later for new additions!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-0">
      {products.map((product) => (
        <ProductCard
          key={product.id || product.slug}
          product={product}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
