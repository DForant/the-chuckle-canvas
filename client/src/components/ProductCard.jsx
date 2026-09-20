import React from 'react';

export function ProductCard({ product, onViewDetails }) {
  const { title, price, imageUrl, slug } = product;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="relative h-64 bg-gray-100 overflow-hidden group">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'}
          alt={title || 'Canvas art'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
      </div>
      
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1" title={title}>
            {title}
          </h3>
          <p className="text-indigo-600 font-semibold text-lg mb-4">
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </p>
        </div>

        <button
          onClick={() => onViewDetails ? onViewDetails(slug) : console.log('View details', slug)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
        >
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
}
