import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (razorpayClient) return razorpayClient;

  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  return razorpayClient;
}

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string
) {
  return getRazorpayClient().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: true,
  });
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;
  const secret = process.env.RAZORPAY_KEY_SECRET as string;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(signature, "utf-8");

  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(signature, "utf-8");

  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
