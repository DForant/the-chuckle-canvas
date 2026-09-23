import React from 'react';
import { CatalogProductSummary } from '../../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: CatalogProductSummary[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm animate-pulse"
          >
            <div className="aspect-square w-full bg-neutral-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-neutral-200 rounded w-1/3" />
                <div className="h-8 bg-neutral-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-16 px-4 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">No products found</h3>
        <p className="mt-1 text-sm text-neutral-500 max-w-md">
          We couldn&apos;t find any canvases matching your current filter criteria. Try selecting a different category or resetting filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
