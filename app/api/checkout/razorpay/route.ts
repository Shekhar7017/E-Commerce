import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { checkoutSchema } from "@/lib/validators";
import { buildOrderFromCart } from "@/lib/services/order.service";
import { createRazorpayOrder } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const { success } = await checkRateLimit(`checkout:${user.id}`);
    if (!success) {
      return apiError("Too many checkout attempts. Please wait a moment.", 429);
    }

    const body = await request.json();
    const input = checkoutSchema.parse(body);

    if (input.paymentMethod !== "razorpay") {
      return apiError("This endpoint only handles Razorpay checkout", 400);
    }

    // Server recalculates the entire order from the live cart + coupon.
    // The amount charged is never taken from the client.
    const built = await buildOrderFromCart({
      userId: user.id,
      addressId: input.addressId,
      paymentMethod: "razorpay",
      couponCode: input.couponCode,
    });

    const receipt = generateOrderNumber();
    const razorpayOrder = await createRazorpayOrder(built.total * 100, receipt);

    return apiSuccess({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      addressId: input.addressId,
      couponCode: input.couponCode,
      total: built.total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
