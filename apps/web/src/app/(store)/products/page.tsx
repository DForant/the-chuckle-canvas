import React, { useState, useEffect } from "react";
import { CatalogFilters } from "../../components/catalog/CatalogFilters";
import { ProductGrid } from "../../components/catalog/ProductGrid";
import { CatalogProductSummary, CatalogQueryFilters } from "../../types/product";

export default function ProductsPage() {
  const [filters, setFilters] = useState<CatalogQueryFilters>({
    category: undefined,
    sort: "newest",
    page: 1,
    limit: 12
  });

  const [products, setProducts] = useState<CatalogProductSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.set("category", filters.category);
        if (filters.sort) queryParams.set("sort", filters.sort);
        if (filters.page) queryParams.set("page", filters.page.toString());
        if (filters.limit) queryParams.set("limit", filters.limit.toString());

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalCount(data.totalCount || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<CatalogQueryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-base text-gray-600 mt-2">
            Explore our hilarious collection of humor merchandise, art canvases, posters, and more.
          </p>
        </div>

        {/* Filters & Sorting */}
        <CatalogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={["all", "Canvas Art", "Posters", "Mugs", "Apparel"]}
        />

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
              disabled={(filters.page || 1) <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-700 px-4">
              Page {filters.page || 1} of {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange({ page: Math.min(totalPages, (filters.page || 1) + 1) })}
              disabled={(filters.page || 1) >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
