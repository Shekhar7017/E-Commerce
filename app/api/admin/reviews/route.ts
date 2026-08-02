import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { listReviewsForModeration } from "@/lib/services/review.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const reviews = await listReviewsForModeration(status);
    return apiSuccess(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}
