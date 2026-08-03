import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "./product-grid";
import type { ProductCardData } from "./product-card";

export function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  products: ProductCardData[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
