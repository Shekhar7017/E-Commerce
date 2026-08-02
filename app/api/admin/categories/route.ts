import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { listCategories, createCategory } from "@/lib/services/category.service";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await listCategories(true);
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = categorySchema.parse(body);
    const category = await createCategory(input);
    return apiSuccess(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
