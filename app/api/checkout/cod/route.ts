import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { checkoutSchema } from "@/lib/validators";
import { buildOrderFromCart, createOrder } from "@/lib/services/order.service";
import { sendEmail, orderConfirmationEmailTemplate } from "@/lib/email";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
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

    if (input.paymentMethod !== "cod") {
      return apiError("This endpoint only handles Cash on Delivery checkout", 400);
    }

    const built = await buildOrderFromCart({
      userId: user.id,
      addressId: input.addressId,
      paymentMethod: "cod",
      couponCode: input.couponCode,
    });

    const order = await createOrder({
      userId: user.id,
      built,
      paymentStatus: "pending",
    });

    await connectDB();
    const dbUser = await User.findById(user.id);
    if (dbUser) {
      await sendEmail({
        to: dbUser.email,
        subject: `Order Confirmed — ${order.orderNumber}`,
        html: orderConfirmationEmailTemplate({
          name: dbUser.name,
          orderNumber: order.orderNumber,
          total: order.total,
        }),
      });
    }

    return apiSuccess({ orderNumber: order.orderNumber }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
