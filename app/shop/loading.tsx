import { ProductGridSkeleton } from "@/components/shop/product-grid";

export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <div className="skeleton h-3 w-24 rounded-full mb-3" />
        <div className="skeleton h-10 w-48 rounded-md" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="skeleton h-4 w-20 rounded-full" />
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton h-3 w-36 rounded-full" />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div className="skeleton h-3 w-20 rounded-full" />
            <div className="skeleton h-9 w-40 rounded-full" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}
