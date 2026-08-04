import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "crypto";

const TEST_SECRET = "test_secret_key_for_signature_verification";

describe("Razorpay signature verification", () => {
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;
  const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it("accepts a signature computed with the correct secret", async () => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay");

    const orderId = "order_test123";
    const paymentId = "pay_test456";
    const validSignature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyRazorpaySignature({ orderId, paymentId, signature: validSignature })
    ).toBe(true);
  });

  it("rejects a signature computed with the wrong secret", async () => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay");

    const orderId = "order_test123";
    const paymentId = "pay_test456";
    const forgedSignature = crypto
      .createHmac("sha256", "wrong_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyRazorpaySignature({ orderId, paymentId, signature: forgedSignature })
    ).toBe(false);
  });

  it("rejects a signature for a tampered order/payment id pair", async () => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay");

    const validSignature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update("order_original|pay_original")
      .digest("hex");

    // Attacker tries to reuse a valid signature against a different order
    expect(
      verifyRazorpaySignature({
        orderId: "order_different",
        paymentId: "pay_original",
        signature: validSignature,
      })
    ).toBe(false);
  });

  it("rejects a signature of the wrong length without throwing", async () => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay");

    expect(() =>
      verifyRazorpaySignature({
        orderId: "order_test123",
        paymentId: "pay_test456",
        signature: "too-short",
      })
    ).not.toThrow();

    expect(
      verifyRazorpaySignature({
        orderId: "order_test123",
        paymentId: "pay_test456",
        signature: "too-short",
      })
    ).toBe(false);
  });

  it("rejects an empty signature", async () => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay");

    expect(
      verifyRazorpaySignature({
        orderId: "order_test123",
        paymentId: "pay_test456",
        signature: "",
      })
    ).toBe(false);
  });

  it("webhook signature verification follows the same tamper-resistance rules", async () => {
    const { verifyRazorpayWebhookSignature } = await import("@/lib/razorpay");

    const rawBody = JSON.stringify({ event: "payment.captured" });
    const validSignature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(rawBody)
      .digest("hex");

    expect(verifyRazorpayWebhookSignature(rawBody, validSignature)).toBe(true);
    expect(
      verifyRazorpayWebhookSignature(rawBody + "tampered", validSignature)
    ).toBe(false);
  });
});
