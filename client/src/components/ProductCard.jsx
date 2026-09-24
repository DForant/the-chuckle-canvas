import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  if (!product) return null;

  const { id, title, slug, price, imageUrl, description } = product;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
            <ShoppingBag className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a
            href={`/products/${slug}`}
            className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg hover:bg-white flex items-center space-x-1 transition transform active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Detail</span>
          </a>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-lg font-extrabold text-indigo-600">
            {price || 'Price on request'}
          </span>
          <a
            href={`/products/${slug}`}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Details &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
