"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { AddressSelector } from "@/components/checkout/address-selector";
import { useRazorpayScript } from "@/components/checkout/use-razorpay-script";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Something went wrong");
  }
  return json.data;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, discount, couponCode, isLoading: cartLoading } = useCart();
  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const razorpayReady = useRazorpayScript();

  const total = Math.max(0, subtotal - discount);

  async function handlePlaceOrder() {
    if (!addressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "cod") {
        const data = await fetchJson("/api/checkout/cod", {
          method: "POST",
          body: JSON.stringify({
            addressId,
            paymentMethod: "cod",
            couponCode: couponCode ?? undefined,
          }),
        });
        router.push(`/checkout/success?order=${data.orderNumber}`);
        return;
      }

      if (!razorpayReady) {
        toast.error("Payment gateway is still loading. Please try again.");
        setIsProcessing(false);
        return;
      }

      const orderData = await fetchJson("/api/checkout/razorpay", {
        method: "POST",
        body: JSON.stringify({
          addressId,
          paymentMethod: "razorpay",
          couponCode: couponCode ?? undefined,
        }),
      });

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "L'Atelier Haute Boutique",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: session?.user?.name ?? "",
          email: session?.user?.email ?? "",
        },
        theme: { color: "#0B6E4F" },
        handler: async (response: unknown) => {
          const paymentResponse = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyData = await fetchJson("/api/checkout/verify", {
              method: "POST",
              body: JSON.stringify({
                ...paymentResponse,
                addressId,
                couponCode: couponCode ?? undefined,
              }),
            });
            router.push(`/checkout/success?order=${verifyData.orderNumber}`);
          } catch {
            router.push("/checkout/failure");
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });

      razorpay.on("payment.failed", () => {
        router.push("/checkout/failure");
      });

      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setIsProcessing(false);
    }
  }

  if (cartLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-emerald-500" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="font-display text-3xl mb-3">Your bag is empty.</p>
        <p className="text-ink/60 dark:text-ivory/60">
          Add something to your bag before checking out.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="font-display text-xl mb-5">Delivery Address</h2>
            <AddressSelector selectedId={addressId} onSelect={setAddressId} />
          </div>

          <div>
            <h2 className="font-display text-xl mb-5">Payment Method</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("razorpay")}
                aria-pressed={paymentMethod === "razorpay"}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-colors",
                  paymentMethod === "razorpay"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-ink/15 dark:border-ivory/20"
                )}
              >
                <p className="text-sm font-medium">Pay Online</p>
                <p className="text-xs text-ink/60 dark:text-ivory/60">
                  Credit/Debit Card, UPI, Net Banking via Razorpay
                </p>
              </button>
              <button
                onClick={() => setPaymentMethod("cod")}
                aria-pressed={paymentMethod === "cod"}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-colors",
                  paymentMethod === "cod"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-ink/15 dark:border-ivory/20"
                )}
              >
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-ink/60 dark:text-ivory/60">
                  Pay when your order arrives
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-6 h-fit sticky top-28">
          <h2 className="font-display text-xl mb-6">Order Summary</h2>

          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-ink/70 dark:text-ivory/70 line-clamp-1">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-mono shrink-0 ml-2">
                  {formatCurrency(item.product.finalPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="tape-divider--dense my-5" />

          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-ivory/60">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-ivory/60">Shipping</span>
              <span className="font-mono">Free</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-medium mb-6">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !addressId}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : paymentMethod === "cod" ? (
              "Place Order"
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
