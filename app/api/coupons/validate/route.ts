import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { validateCoupon } from "@/lib/services/coupon.service";
import { getCart } from "@/lib/services/cart.service";

const schema = z.object({ code: z.string().trim().min(1) });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { code } = schema.parse(body);

    const cart = await getCart(user.id);
    if (cart.items.length === 0) {
      return apiError("Your cart is empty", 400);
    }

    const result = await validateCoupon(code, user.id, cart.subtotal);
    return apiSuccess({
      code: result.coupon.code,
      discount: result.discount,
      description: result.coupon.description,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
