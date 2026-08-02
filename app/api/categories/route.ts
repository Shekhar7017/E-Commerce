import { apiSuccess, handleApiError } from "@/lib/api-response";
import { listCategories } from "@/lib/services/category.service";

export async function GET() {
  try {
    const categories = await listCategories(false);
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
