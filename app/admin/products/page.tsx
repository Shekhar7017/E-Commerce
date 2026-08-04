"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Loader2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatCurrency, cn } from "@/lib/utils";

interface AdminProduct {
  _id: string;
  name: string;
  sku: string;
  brand: string;
  category: { name: string } | null;
  finalPrice: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  images: { url: string; isPrimary: boolean }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) setProducts(json.data.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadProducts]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete product");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog."
        action={
          <Link href="/admin/products/new" className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </Link>
        }
      />

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field !rounded-full pl-10"
        />
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : products.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 dark:border-ivory/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-ivory/10 text-left text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const image =
                  product.images.find((img) => img.isPrimary) ?? product.images[0];
                const lowStock = product.stock <= product.lowStockThreshold;
                return (
                  <tr
                    key={product._id}
                    className="border-b border-ink/5 dark:border-ivory/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5">
                          {image && (
                            <Image
                              src={image.url}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3">{product.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(product.finalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(lowStock && "text-gold-deep dark:text-gold")}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs",
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-ink/10 text-ink/50 dark:bg-ivory/10 dark:text-ivory/50"
                        )}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="text-ink/50 hover:text-emerald-500"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-ink/50 hover:text-red-500"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
