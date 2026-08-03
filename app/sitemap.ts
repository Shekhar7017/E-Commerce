import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/services/product.service";
import { listCategories } from "@/lib/services/category.service";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/login",
    "/register",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const [categories, { items: products }] = await Promise.all([
      listCategories(false),
      listProducts({ limit: 60, sort: "newest" }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch {
    // If the database is unreachable at build/generation time, fall back
    // to static routes only rather than failing the whole sitemap.
    return staticEntries;
  }
}
