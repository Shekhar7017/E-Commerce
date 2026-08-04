import { ProductGridSkeleton } from "@/components/shop/product-grid";

export default function CategoryLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <div className="skeleton h-3 w-24 rounded-full mb-3" />
        <div className="skeleton h-10 w-64 rounded-md" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-9 w-40 rounded-full" />
      </div>

      <ProductGridSkeleton count={8} />
    </main>
  );
}
