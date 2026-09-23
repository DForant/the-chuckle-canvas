'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CatalogFiltersProps {
  categories?: string[];
  selectedCategory?: string;
  selectedSort?: string;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Classic Parody',
  'Modern Memes',
  'Animals',
  'Space & Sci-Fi',
];

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = 'All',
  selectedSort = 'newest',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortVal = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (sortVal) {
      params.set('sort', sortVal);
    } else {
      params.delete('sort');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 border-b border-neutral-200 mb-8">
      {/* Category Tabs / Pills */}
      <nav aria-label="Product Categories" className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {categories.map((cat) => {
          const isActive = (selectedCategory === cat) || (!selectedCategory && cat === 'All');
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* Sort Select */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        <label htmlFor="sort-select" className="text-sm font-medium text-neutral-600 whitespace-nowrap">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={selectedSort}
          onChange={handleSortChange}
          className="rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm font-medium text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          <option value="newest">Newest Additions</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
