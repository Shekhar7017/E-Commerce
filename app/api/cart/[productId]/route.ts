import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { updateCartItem, removeFromCart } from "@/lib/services/cart.service";

const updateSchema = z.object({ quantity: z.coerce.number().int().min(1).max(20) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireUser();
    const { productId } = await params;
    const body = await request.json();
    const { quantity } = updateSchema.parse(body);
    const cart = await updateCartItem(user.id, productId, quantity);
    return apiSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireUser();
    const { productId } = await params;
    const cart = await removeFromCart(user.id, productId);
    return apiSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
