import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { createReview, listProductReviews } from "@/lib/services/review.service";
import { reviewSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product");
    if (!productId) return apiError("Missing product id", 400);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const result = await listProductReviews(productId, page);
    return apiSuccess(result, 200, {
      cache: "public, s-maxage=60, stale-while-revalidate=120",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = reviewSchema.parse(body);
    const review = await createReview(user.id, input);
    return apiSuccess(review, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
