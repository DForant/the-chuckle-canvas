import React from "react";
import { CatalogProductSummary } from "../../types/product";

interface ProductCardProps {
  product: CatalogProductSummary;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.startingPriceInCents / 100);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <a href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View details for ${product.title}`}>
        <span className="sr-only">View {product.title}</span>
      </a>
      
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.primaryImageUrl}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {!product.isAvailable && (
          <span className="absolute top-3 right-3 z-20 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            Sold Out
          </span>
        )}
        <span className="absolute top-3 left-3 z-20 bg-gray-900/75 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
          {product.category}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          <h3 className="text-gray-900 font-semibold text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {product.availableVariantCount > 1 ? `${product.availableVariantCount} options available` : "Standard Edition"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-950">{formattedPrice}</span>
          <span className="inline-flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            View Item &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
