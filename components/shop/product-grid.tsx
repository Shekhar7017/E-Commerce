import { ProductCard, type ProductCardData } from "./product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl mb-2">Nothing here yet.</p>
        <p className="text-ink/60 dark:text-ivory/60 text-sm">
          Try adjusting your filters or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] w-full rounded-lg" />
          <div className="skeleton h-3 w-1/3 mt-4 rounded-full" />
          <div className="skeleton h-4 w-3/4 mt-2 rounded-full" />
          <div className="skeleton h-3 w-1/4 mt-2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
