import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { id, title, slug, price, imageUrl, description } = product;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || 'Product image'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">
            No image available
          </div>
        )}
        {price && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 font-bold px-3 py-1 rounded-full text-xs shadow-sm">
            {price}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: description }} />
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-600">
            {price || 'View Details'}
          </span>
          <Link
            to={`/products/${slug || id}`}
            className="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            View Canvas
          </Link>
        </div>
      </div>
    </div>
  );
}
