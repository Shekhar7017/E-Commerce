import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await connectDB();
        await Order.findOneAndUpdate(
          { razorpayOrderId: payment.order_id, paymentStatus: { $ne: "paid" } },
          {
            paymentStatus: "paid",
            status: "paid",
            razorpayPaymentId: payment.id,
            $push: {
              statusHistory: {
                status: "paid",
                note: "Confirmed via Razorpay webhook",
                changedAt: new Date(),
              },
            },
          }
        );
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await connectDB();
        await Order.findOneAndUpdate(
          { razorpayOrderId: payment.order_id },
          { paymentStatus: "failed" }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
