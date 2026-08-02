import { NextRequest } from "next/server";
import { apiSuccess, handleApiError, ApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { updateOrderStatus } from "@/lib/services/order.service";
import { orderStatusUpdateSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .populate("items.product", "name slug images");
    if (!order) throw new ApiError("Order not found", 404);
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = orderStatusUpdateSchema.parse(body);

    const order = await updateOrderStatus(id, input.status, {
      note: input.note,
      trackingNumber: input.trackingNumber,
      carrier: input.carrier,
    });

    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
