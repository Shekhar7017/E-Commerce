import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/product.service";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCartPanel } from "@/components/shop/add-to-cart-panel";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ProductGrid } from "@/components/shop/product-grid";
import { formatCurrency } from "@/lib/utils";
import { ApiError } from "@/lib/api-response";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.metaTitle || product.name,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? "",
      images: product.images.map((img) => ({ url: img.url })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.category as unknown as {
    _id: string;
    name: string;
    slug: string;
  };

  const related = await getRelatedProducts(
    product._id.toString(),
    category._id.toString()
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.finalPrice,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`,
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-xs text-ink/50 dark:text-ivory/50">
        <Link href="/shop">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${category.slug}`}>{category.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-ivory">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, alt: img.alt }))}
          productName={product.name}
        />

        <div>
          <p className="text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50">
            {product.brand}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2 leading-tight">
            {product.name}
          </h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.ratingAverage)
                        ? "fill-gold text-gold"
                        : "text-ink/20 dark:text-ivory/20"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-ink/60 dark:text-ivory/60">
                {product.ratingAverage.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <span className="font-mono text-2xl">
              {formatCurrency(product.finalPrice)}
            </span>
            {product.discountPercent > 0 && (
              <>
                <span className="font-mono text-base text-ink/40 dark:text-ivory/40 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs text-ivory">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-6 text-ink/70 dark:text-ivory/70 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          <AddToCartPanel productId={product._id.toString()} stock={product.stock} />

          <div className="tape-divider mt-10 mb-8" />

          <div>
            <h2 className="font-display text-xl mb-4">Description</h2>
            <p className="text-sm text-ink/70 dark:text-ivory/70 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.specifications.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl mb-4">Specifications</h2>
              <dl className="grid grid-cols-1 gap-y-2 text-sm">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.key}
                    className="flex justify-between border-b border-ink/5 dark:border-ivory/5 py-2"
                  >
                    <dt className="text-ink/50 dark:text-ivory/50">{spec.key}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="mt-24">
        <h2 className="font-display text-2xl mb-8">Reviews</h2>
        <ProductReviews productId={product._id.toString()} />
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-2xl mb-8">You May Also Like</h2>
          <ProductGrid products={JSON.parse(JSON.stringify(related))} />
        </div>
      )}
    </main>
  );
}
