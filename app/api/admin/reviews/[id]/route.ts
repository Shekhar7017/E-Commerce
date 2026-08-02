import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { moderateReview, deleteReview } from "@/lib/services/review.service";

const moderateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminReply: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = moderateSchema.parse(body);
    const review = await moderateReview(id, input.status, input.adminReply);
    return apiSuccess(review);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteReview(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
