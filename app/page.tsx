import type { Metadata } from "next";
import { Hero } from "@/components/shop/hero";
import { CategoryShowcase } from "@/components/shop/category-showcase";
import { ProductRail } from "@/components/shop/product-rail";
import { listProducts } from "@/lib/services/product.service";
import { listCategories } from "@/lib/services/category.service";
import type { ProductCardData } from "@/components/shop/product-card";

export const metadata: Metadata = {
  title: "Curated Luxury, Delivered",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

function toCardData(items: unknown[]): ProductCardData[] {
  return JSON.parse(JSON.stringify(items));
}

export default async function HomePage() {
  const [categories, featured, newArrivals, bestsellers] = await Promise.all([
    listCategories(false),
    listProducts({ featured: true, limit: 8 }),
    listProducts({ newArrival: true, limit: 8, sort: "newest" }),
    listProducts({ bestseller: true, limit: 8, sort: "bestselling" }),
  ]);

  return (
    <main>
      <Hero />

      <CategoryShowcase categories={JSON.parse(JSON.stringify(categories))} />

      <ProductRail
        eyebrow="The Selection"
        title="Featured Pieces"
        products={toCardData(featured.items)}
        viewAllHref="/shop?featured=true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="tape-divider" />
      </div>

      <ProductRail
        eyebrow="Just Arrived"
        title="New Arrivals"
        products={toCardData(newArrivals.items)}
        viewAllHref="/shop?newArrival=true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="tape-divider" />
      </div>

      <ProductRail
        eyebrow="Most Loved"
        title="Bestsellers"
        products={toCardData(bestsellers.items)}
        viewAllHref="/shop?bestseller=true"
      />
    </main>
  );
}
