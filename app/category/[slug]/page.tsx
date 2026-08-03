import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { listProducts } from "@/lib/services/product.service";
import { ProductGrid } from "@/components/shop/product-grid";
import { SortDropdown } from "@/components/shop/sort-dropdown";
import { Pagination } from "@/components/shop/pagination";
import { ApiError } from "@/lib/api-response";
import type { ProductQueryParams } from "@/lib/services/product.service";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

async function getCategory(slug: string) {
  try {
    return await getCategoryBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const { items, meta } = await listProducts({
    category: category._id.toString(),
    page: sp.page ? Number(sp.page) : 1,
    sort: (sp.sort as ProductQueryParams["sort"]) ?? "newest",
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <p className="label-eyebrow mb-3">Curated Edit</p>
        <h1 className="font-display text-4xl md:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mt-4 max-w-xl text-ink/60 dark:text-ivory/60">
            {category.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-ink/60 dark:text-ivory/60">
          {meta.totalItems} {meta.totalItems === 1 ? "piece" : "pieces"}
        </p>
        <SortDropdown />
      </div>

      <ProductGrid products={JSON.parse(JSON.stringify(items))} />

      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}
