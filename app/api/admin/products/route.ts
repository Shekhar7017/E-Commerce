import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { listProducts, createProduct } from "@/lib/services/product.service";
import { productSchema } from "@/lib/validators";
import type { ProductQueryParams } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);

    const params: ProductQueryParams = {
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      includeInactive: true,
    };

    const result = await listProducts(params);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = productSchema.parse(body);
    const product = await createProduct(input);
    return apiSuccess(product, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
