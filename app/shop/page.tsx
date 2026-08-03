import type { Metadata } from "next";
import { listProducts } from "@/lib/services/product.service";
import { listCategories } from "@/lib/services/category.service";
import { getDistinctBrands } from "@/lib/services/product.service";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { SortDropdown } from "@/components/shop/sort-dropdown";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import type { ProductQueryParams } from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Shop the Collection",
  alternates: { canonical: "/shop" },
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sp = await searchParams;

  const params: ProductQueryParams = {
    page: sp.page ? Number(sp.page) : 1,
    search: sp.search,
    category: sp.category,
    brand: sp.brand,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    featured: sp.featured === "true",
    bestseller: sp.bestseller === "true",
    newArrival: sp.newArrival === "true",
    sort: (sp.sort as ProductQueryParams["sort"]) ?? "newest",
  };

  const [{ items, meta }, categories, brands] = await Promise.all([
    listProducts(params),
    listCategories(false),
    getDistinctBrands(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <p className="label-eyebrow mb-3">The Full Collection</p>
        <h1 className="font-display text-4xl md:text-5xl">Shop</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <FilterSidebar
          categories={JSON.parse(JSON.stringify(categories))}
          brands={brands}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-ink/60 dark:text-ivory/60">
              {meta.totalItems} {meta.totalItems === 1 ? "piece" : "pieces"}
            </p>
            <SortDropdown />
          </div>

          <ProductGrid products={JSON.parse(JSON.stringify(items))} />

          <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
        </div>
      </div>
    </main>
  );
}
