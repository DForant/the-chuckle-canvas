export interface CatalogProductSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  primaryImageUrl: string;
  startingPriceInCents: number;
  availableVariantCount: number;
  isAvailable: boolean;
}

export interface CatalogQueryFilters {
  category?: string;
  sort?: "price-asc" | "price-desc" | "newest";
  page?: number;
  limit?: number;
}

export interface CatalogResponse {
  products: CatalogProductSummary[];
  totalCount: number;
  page: number;
  totalPages: number;
}
