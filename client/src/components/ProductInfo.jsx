import React, { useState } from 'react';
import { Minus, Plus, Tag, Layers, CheckCircle2 } from 'lucide-react';
import AddToCartButton from './AddToCartButton';

export default function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.imageUrl || '');

  const galleryImages = [
    product.imageUrl,
    ...(product.gallery || [])
  ].filter(Boolean);

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Product Imagery */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
          {product.price && (
            <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 font-extrabold px-4 py-2 rounded-2xl text-sm shadow-md">
              {product.price}
            </span>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-gray-50 ${
                  selectedImage === imgUrl ? 'border-indigo-600 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details & Purchase Actions */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8">
        <div>
          {product.categories && product.categories.length > 0 && (
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Tag className="w-3.5 h-3.5" />
              <span>{product.categories.map(c => c.name).join(', ')}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            {product.title}
          </h1>
          <div className="text-2xl font-bold text-indigo-600 mb-6">
            {product.price || 'Price on request'}
          </div>
          {product.description && (
            <div
              className="text-gray-600 text-sm sm:text-base leading-relaxed prose prose-indigo max-w-none border-t border-gray-100 pt-6"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
        </div>

        <div className="space-y-6 pt-6 border-t border-gray-100">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Quantity</span>
            <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-sm">
              <button
                onClick={decreaseQuantity}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-gray-900 text-sm">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AddToCartButton product={product} quantity={quantity} />
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Museum-grade poly-cotton canvas</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Sustainably sourced pine wood frame</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
