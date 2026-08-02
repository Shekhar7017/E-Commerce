import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { getWishlist } from "@/lib/services/user.service";

export async function GET() {
  try {
    const user = await requireUser();
    const wishlist = await getWishlist(user.id);
    return apiSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}
