import { apiSuccess, handleApiError } from "@/lib/api-response";
import { listCategories } from "@/lib/services/category.service";

export async function GET() {
  try {
    const categories = await listCategories(false);
    return apiSuccess(categories, 200, {
      cache: "public, s-maxage=120, stale-while-revalidate=300",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
