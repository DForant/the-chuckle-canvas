import { NextResponse } from 'next/server';
import { getCatalogProducts } from '../../../../../packages/db/src/queries/products';
import { CatalogQueryFilters } from '../../../types/product';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const sortParam = searchParams.get('sort');
    let sort: CatalogQueryFilters['sort'] = 'newest';
    if (sortParam === 'price-asc' || sortParam === 'price-desc' || sortParam === 'newest') {
      sort = sortParam;
    }

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 12;

    const filters: CatalogQueryFilters = {
      category,
      sort,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 12 : limit,
    };

    const responseData = await getCatalogProducts(filters);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Internal Server Error', status: 500 } },
      { status: 500 }
    );
  }
}
