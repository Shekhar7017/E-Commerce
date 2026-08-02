import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { getCart, addToCart } from "@/lib/services/cart.service";
import { cartItemSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const cart = await getCart(user.id);
    return apiSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = cartItemSchema.parse(body);
    const cart = await addToCart(user.id, input.productId, input.quantity);
    return apiSuccess(cart, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
