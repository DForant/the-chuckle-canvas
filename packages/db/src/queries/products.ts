import { CatalogQueryFilters, CatalogResponse, CatalogProductSummary } from "../types/product";

// If you have a shared database or ORM layer, packages/db/src/queries/products.ts can interact with it.
// Here we implement the query layer supporting pagination, category filtering, and sorting.

export async function fetchCatalogProducts(filters: CatalogQueryFilters = {}): Promise<CatalogResponse> {
  const { category, sort = "newest", page = 1, limit = 12 } = filters;

  // In a real DB/ORM setup, we query products here. We fallback to querying the internal API or mock dataset if needed.
  const queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (sort) queryParams.set("sort", sort);
  if (page) queryParams.set("page", page.toString());
  if (limit) queryParams.set("limit", limit.toString());

  const targetUrl = `/api/products?${queryParams.toString()}`;
  
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch catalog products: ${res.statusText}`);
    }
    const data = await res.json();

    // If API returns old format { products: [...], pageInfo: {...} } or new CatalogResponse format:
    const products: CatalogProductSummary[] = (data.products || []).map((p: any) => ({
      id: p.id || p.slug,
      slug: p.slug,
      title: p.title || p.name || "Untitled Product",
      category: p.category || (p.categories?.[0]?.name) || "General",
      primaryImageUrl: p.primaryImageUrl || p.imageUrl || p.image || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
      startingPriceInCents: p.startingPriceInCents ?? Math.round(parseFloat(p.price?.replace(/[^0-9.]/g, "") || "19.99") * 100),
      availableVariantCount: p.availableVariantCount ?? 1,
      isAvailable: p.isAvailable ?? true
    }));

    const totalCount = data.totalCount || products.length;
    const totalPages = data.totalPages || Math.ceil(totalCount / limit) || 1;

    return {
      products,
      totalCount,
      page,
      totalPages
    };
  } catch (err) {
    console.error("Error fetching catalog products:", err);
    // Return empty fallback structure
    return {
      products: [],
      totalCount: 0,
      page,
      totalPages: 1
    };
  }
}
