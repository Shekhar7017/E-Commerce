import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { buildOrderFromCart, createOrder } from "@/lib/services/order.service";
import { sendEmail, orderConfirmationEmailTemplate } from "@/lib/email";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  addressId: z.string().min(1),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = schema.parse(body);

    const isValid = verifyRazorpaySignature({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });

    if (!isValid) {
      return apiError("Payment verification failed. Please contact support.", 400);
    }

    // Rebuild the order server-side from the live cart — the same amount
    // that was charged via Razorpay — rather than trusting anything the
    // client claims about cart contents at this stage.
    const built = await buildOrderFromCart({
      userId: user.id,
      addressId: input.addressId,
      paymentMethod: "razorpay",
      couponCode: input.couponCode,
    });

    const order = await createOrder({
      userId: user.id,
      built,
      paymentStatus: "paid",
      razorpayOrderId: input.razorpay_order_id,
      razorpayPaymentId: input.razorpay_payment_id,
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
