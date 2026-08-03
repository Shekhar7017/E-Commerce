"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, discount, couponCode, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } =
    useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    try {
      await applyCoupon(couponInput.trim());
    } catch {
      // handled by context
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
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
        <p className="text-ink/60 dark:text-ivory/60 mb-8">
          Discover pieces worth carrying.
        </p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </main>
    );
  }

  const total = Math.max(0, subtotal - discount);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl mb-12">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            const image =
              item.product.images.find((img) => img.isPrimary) ??
              item.product.images[0];
            return (
              <div
                key={item.product._id}
                className="flex gap-4 border-b border-ink/10 dark:border-ivory/10 pb-6"
              >
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5"
                >
                  {image && (
                    <Image
                      src={image.url}
                      alt={item.product.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-display text-base hover:text-emerald-500"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      aria-label="Remove item"
                      className="text-ink/40 hover:text-ink"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-ink/50 dark:text-ivory/50 mt-1">
                    SKU: {item.product.sku}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center rounded-full border border-ink/15 dark:border-ivory/20">
                      <button
                        onClick={() =>
                          updateItem(item.product._id, Math.max(1, item.quantity - 1))
                        }
                        className="p-2 hover:text-emerald-500"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItem(
                            item.product._id,
                            Math.min(item.product.stock, item.quantity + 1)
                          )
                        }
                        className="p-2 hover:text-emerald-500"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-mono text-sm">
                      {formatCurrency(item.product.finalPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-panel rounded-lg p-6 h-fit sticky top-28">
          <h2 className="font-display text-xl mb-6">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-ivory/60">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({couponCode})</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-ivory/60">Shipping</span>
              <span className="font-mono">Free</span>
            </div>
          </div>

          <div className="tape-divider--dense my-5" />

          {couponCode ? (
            <div className="flex items-center justify-between text-sm mb-5">
              <span>
                Coupon <strong>{couponCode}</strong> applied
              </span>
              <button
                onClick={removeCoupon}
                className="text-xs text-ink/50 hover:text-ink"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-5">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-4 py-2 text-sm focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isApplying}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Apply
              </button>
            </form>
          )}

          <div className="flex justify-between text-lg font-medium mb-6">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          <Link href="/checkout" className="btn-primary w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
