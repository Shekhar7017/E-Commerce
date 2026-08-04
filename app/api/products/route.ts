import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { listProducts } from "@/lib/services/product.service";
import type { ProductQueryParams } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: ProductQueryParams = {
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      featured: searchParams.get("featured") === "true",
      bestseller: searchParams.get("bestseller") === "true",
      newArrival: searchParams.get("newArrival") === "true",
      sort: (searchParams.get("sort") as ProductQueryParams["sort"]) ?? undefined,
    };

    const result = await listProducts(params);
    return apiSuccess(result, 200, {
      cache: "public, s-maxage=30, stale-while-revalidate=60",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
