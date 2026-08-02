import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { listCustomers } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);

    const result = await listCustomers({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      search: searchParams.get("search") ?? undefined,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
