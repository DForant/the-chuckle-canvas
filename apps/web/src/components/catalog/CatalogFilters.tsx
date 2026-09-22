import React from "react";
import { CatalogQueryFilters } from "../../types/product";

interface CatalogFiltersProps {
  filters: CatalogQueryFilters;
  onFilterChange: (newFilters: Partial<CatalogQueryFilters>) => void;
  categories: string[];
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onFilterChange,
  categories = ["all", "Canvas Art", "Posters", "Mugs", "Apparel"]
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = (filters.category || "all") === cat.toLowerCase() || (cat === "all" && !filters.category);
          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat === "all" ? undefined : cat.toLowerCase(), page: 1 })}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3 justify-end">
        <label htmlFor="sort-select" className="text-sm font-medium text-gray-600 whitespace-nowrap">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={filters.sort || "newest"}
          onChange={(e) => onFilterChange({ sort: e.target.value as any, page: 1 })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
