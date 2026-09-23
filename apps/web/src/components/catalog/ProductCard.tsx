import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CatalogProductSummary } from '../../types/product';

interface ProductCardProps {
  product: CatalogProductSummary;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.startingPriceInCents / 100);

  const outOfStock = !product.isAvailable || product.availableVariantCount === 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail Container with fixed aspect ratio to prevent CLS */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.primaryImageUrl}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-neutral-800 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Out of Stock Overlay / Badge */}
        {outOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-md bg-neutral-900/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <Link href={`/products/${product.slug}`} className="group-hover:underline">
            <h3 className="text-base font-semibold text-neutral-900 line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500">Starting at</span>
            <span className="text-lg font-bold text-neutral-900">{formattedPrice}</span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              outOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
            tabIndex={outOfStock ? -1 : 0}
            aria-disabled={outOfStock}
          >
            {outOfStock ? 'Unavailable' : 'View Canvas'}
          </Link>
        </div>
      </div>
    </div>
  );
};
