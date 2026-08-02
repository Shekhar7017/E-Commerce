import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { toggleWishlist } from "@/lib/services/user.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireUser();
    const { productId } = await params;
    const result = await toggleWishlist(user.id, productId);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
