"use client";

import { useState } from "react";
import { Heart, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";

export function AddToCartPanel({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  async function handleAdd() {
    setIsAdding(true);
    try {
      await addItem(productId, quantity);
    } catch {
      // handled by cart context toast
    } finally {
      setIsAdding(false);
    }
  }

  async function handleWishlist() {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setWishlisted(json.data.added);
      toast.success(json.data.added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Sign in to save items to your wishlist");
    }
  }

  if (stock === 0) {
    return (
      <div className="mt-8">
        <button disabled className="btn-primary w-full opacity-50">
          Sold Out
        </button>
        <p className="mt-3 text-sm text-ink/50 dark:text-ivory/50">
          This piece is currently unavailable. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-ink/15 dark:border-ivory/20">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-3 hover:text-emerald-500"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-mono">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock, 20, q + 1))}
            className="p-3 hover:text-emerald-500"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 dark:border-ivory/20 hover:border-emerald-500 transition-colors"
        >
          <Heart
            size={18}
            className={wishlisted ? "fill-emerald-500 text-emerald-500" : ""}
          />
        </button>
      </div>

      <button onClick={handleAdd} disabled={isAdding} className="btn-primary w-full">
        {isAdding ? <Loader2 size={16} className="animate-spin" /> : "Add to Bag"}
      </button>

      {stock <= 5 && (
        <p className="text-xs text-gold-deep dark:text-gold">
          Only {stock} left — considered pieces don&apos;t linger.
        </p>
      )}
    </div>
  );
}
