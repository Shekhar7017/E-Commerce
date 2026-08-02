import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { listUserOrders } from "@/lib/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;

    const result = await listUserOrders(user.id, page, limit);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
