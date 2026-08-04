import { apiSuccess, handleApiError } from "@/lib/api-response";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { listProducts } from "@/lib/services/product.service";
import type { ProductQueryParams } from "@/lib/services/product.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    const { searchParams } = new URL(request.url);
    const products = await listProducts({
      category: category._id.toString(),
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      sort: (searchParams.get("sort") as ProductQueryParams["sort"]) ?? undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    });

    return apiSuccess(
      { category, ...products },
      200,
      { cache: "public, s-maxage=30, stale-while-revalidate=60" }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
