import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { getOrderByNumber, cancelOwnOrder } from "@/lib/services/order.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const user = await requireUser();
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber, user.id);
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}

const cancelSchema = z.object({ reason: z.string().max(500).optional() });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const user = await requireUser();
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber, user.id);

    const body = await request.json().catch(() => ({}));
    const { reason } = cancelSchema.parse(body);

    const cancelled = await cancelOwnOrder(order._id.toString(), user.id, reason);
    return apiSuccess(cancelled);
  } catch (error) {
    return handleApiError(error);
  }
}
