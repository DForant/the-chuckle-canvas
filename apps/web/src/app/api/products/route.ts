import { NextResponse } from "next/server";

// Next.js API route implementation for products query layer
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const sort = url.searchParams.get("sort") || "newest";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);

    // Forward to backend API or aggregate mock products
    const backendUrl = process.env.API_TARGET || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/products`);
    
    let rawProducts = [];
    if (res.ok) {
      const data = await res.json();
      rawProducts = data.products || [];
    } else {
      // Fallback mock dataset if backend is unreachable during build/test
      rawProducts = [
        {
          id: "prod-1",
          slug: "funny-cat-canvas",
          title: "Funny Cat Oil Painting Canvas",
          category: "Canvas Art",
          primaryImageUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80",
          startingPriceInCents: 2499,
          availableVariantCount: 3,
          isAvailable: true
        },
        {
          id: "prod-2",
          slug: "sarcastic-dog-poster",
          title: "Sarcastic Dog Wall Poster",
          category: "Posters",
          primaryImageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80",
          startingPriceInCents: 1499,
          availableVariantCount: 2,
          isAvailable: true
        },
        {
          id: "prod-3",
          slug: "meme-lord-mug",
          title: "The Ultimate Meme Lord Ceramic Mug",
          category: "Mugs",
          primaryImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
          startingPriceInCents: 1299,
          availableVariantCount: 1,
          isAvailable: true
        },
        {
          id: "prod-4",
          slug: "absurdist-duck-hoodie",
          title: "Absurdist Rubber Duck Unisex Hoodie",
          category: "Apparel",
          primaryImageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
          startingPriceInCents: 4599,
          availableVariantCount: 4,
          isAvailable: true
        }
      ];
    }

    let filtered = rawProducts.map((p: any) => ({
      id: p.id || p.slug,
      slug: p.slug,
      title: p.title || p.name || "Untitled",
      category: p.category || "General",
      primaryImageUrl: p.primaryImageUrl || p.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
      startingPriceInCents: p.startingPriceInCents ?? Math.round(parseFloat(p.price?.replace(/[^0-9.]/g, "") || "19.99") * 100),
      availableVariantCount: p.availableVariantCount ?? 1,
      isAvailable: p.isAvailable ?? true
    }));

    if (category && category !== "all") {
      filtered = filtered.filter((p: any) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (sort === "price-asc") {
      filtered.sort((a: any, b: any) => a.startingPriceInCents - b.startingPriceInCents);
    } else if (sort === "price-desc") {
      filtered.sort((a: any, b: any) => b.startingPriceInCents - a.startingPriceInCents);
    } else if (sort === "newest") {
      // Default order or newest first
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      products: paginated,
      totalCount,
      page,
      totalPages
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message, status: 500 } }, { status: 500 });
  }
}
