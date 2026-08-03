"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  finalPrice: number;
  discountPercent: number;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  ratingAverage: number;
  ratingCount: number;
  stock: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];
  const secondaryImage = product.images[1];

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/wishlist/${product._id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setWishlisted(json.data.added);
      toast.success(json.data.added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Sign in to save items to your wishlist");
    }
  }

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await addItem(product._id, 1);
    } catch {
      // toast already shown by cart context
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-ink/5 dark:bg-ivory/5">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-700",
              secondaryImage ? "group-hover:opacity-0" : ""
            )}
          />
        )}
        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-ivory">
            -{product.discountPercent}%
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 dark:bg-ink/80 backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-emerald-500 text-emerald-500" : "text-ink"}
          />
        </button>

        {product.stock === 0 ? (
          <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-xs uppercase tracking-widest2 text-ivory">
            Sold Out
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            className="absolute inset-x-0 bottom-0 translate-y-full bg-emerald-600 py-2.5 text-center text-xs uppercase tracking-widest2 text-ivory transition-transform duration-300 group-hover:translate-y-0"
          >
            Quick Add
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[11px] uppercase tracking-widest2 text-ink/50 dark:text-ivory/50">
          {product.brand}
        </p>
        <h3 className="font-display text-base leading-snug line-clamp-1">
          {product.name}
        </h3>

        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-gold text-gold" />
            <span className="text-xs text-ink/60 dark:text-ivory/60">
              {product.ratingAverage.toFixed(1)} ({product.ratingCount})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span className="font-mono text-sm">{formatCurrency(product.finalPrice)}</span>
          {product.discountPercent > 0 && (
            <span className="font-mono text-xs text-ink/40 dark:text-ivory/40 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
