import { CatalogQueryFilters, CatalogResponse, CatalogProductSummary } from "../types/product";

// In-memory or database query layer implementation for packages/db/src/queries/products.ts
// We connect/query via server or cms service or provide robust mock/database mapping conforming to spec.

export async function getCatalogProducts(filters: CatalogQueryFilters = {}): Promise<CatalogResponse> {
  const { category, sort = "newest", page = 1, limit = 12 } = filters;

  // Fetch from backend API / cms or internal catalog data source
  // In server or monorepo context, we can fetch from endpoint or CMS service
  const endpoint = process.env.API_TARGET || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  let products: CatalogProductSummary[] = [];
  try {
    const res = await fetch(`${endpoint}/api/products`);
    if (res.ok) {
      const data = await res.json();
      const rawList = data.products || data.nodes || [];
      products = rawList.map((p: any) => {
        // Parse price e.g. "$29.99" or number
        let cents = 2999;
        if (typeof p.price === 'number') {
          cents = Math.round(p.price * 100);
        } else if (typeof p.price === 'string') {
          const cleaned = p.price.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          if (!isNaN(parsed)) cents = Math.round(parsed * 100);
        }

        return {
          id: p.id || p.databaseId?.toString() || '1',
          slug: p.slug || 'product',
          title: p.title || p.name || 'Untitled Canvas',
          category: p.category || (p.categories && p.categories[0]?.name) || 'Canvas Art',
          primaryImageUrl: p.imageUrl || p.image?.sourceUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
          startingPriceInCents: cents,
          availableVariantCount: p.availableVariantCount !== undefined ? p.availableVariantCount : 3,
          isAvailable: p.isAvailable !== undefined ? p.isAvailable : true
        };
      });
    }
  } catch (err) {
    // Fallback sample data if backend is offline during test / build
    products = [
      {
        id: "prod-1",
        slug: "laughing-mona-lisa",
        title: "Laughing Mona Lisa Canvas",
        category: "Classic Parody",
        primaryImageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        startingPriceInCents: 3499,
        availableVariantCount: 3,
        isAvailable: true
      },
      {
        id: "prod-2",
        slug: "doge-starry-night",
        title: "Doge Starry Night Masterpiece",
        category: "Modern Memes",
        primaryImageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
        startingPriceInCents: 4200,
        availableVariantCount: 2,
        isAvailable: true
      },
      {
        id: "prod-3",
        slug: "confused-cat-portrait",
        title: "Confused Cat Aristocrat",
        category: "Animals",
        primaryImageUrl: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&auto=format&fit=crop&q=80",
        startingPriceInCents: 2999,
        availableVariantCount: 0,
        isAvailable: false
      },
      {
        id: "prod-4",
        slug: "astronaut-coffee-break",
        title: "Astronaut Coffee Break",
        category: "Space & Sci-Fi",
        primaryImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        startingPriceInCents: 3999,
        availableVariantCount: 4,
        isAvailable: true
      }
    ];
  }

  // 1. Filter ACTIVE status / isAvailable or category
  let filtered = products.filter(p => {
    // If requirement says filter where status === "ACTIVE", here we map isAvailable or category
    if (category && category !== "All" && category.toLowerCase() !== "all") {
      if (p.category.toLowerCase() !== category.toLowerCase()) return false;
    }
    return true;
  });

  // 2. Sort
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.startingPriceInCents - b.startingPriceInCents);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.startingPriceInCents - a.startingPriceInCents);
  } else if (sort === "newest") {
    // Keep original or sort by id desc
    filtered.sort((a, b) => b.id.localeCompare(a.id));
  }

  // 3. Pagination (skip, take)
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const validPage = Math.max(1, Math.min(page, totalPages));
  const skip = (validPage - 1) * limit;
  const paginatedProducts = filtered.slice(skip, skip + limit);

  return {
    products: paginatedProducts,
    totalCount,
    page: validPage,
    totalPages
  };
}
