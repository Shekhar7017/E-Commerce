"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";

interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  image?: { url: string };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize your product catalog into collections."
        action={
          <Link href="/admin/categories/new" className="btn-primary text-sm">
            <Plus size={16} /> Add Category
          </Link>
        }
      />

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-lg border border-ink/10 dark:border-ivory/10 p-4 flex items-center gap-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5">
                {cat.image?.url && (
                  <Image src={cat.image.url} alt={cat.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{cat.name}</p>
                <span
                  className={cn(
                    "text-xs",
                    cat.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-ink/40 dark:text-ivory/40"
                  )}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/categories/${cat._id}/edit`}
                  className="text-ink/50 hover:text-emerald-500"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-ink/50 hover:text-red-500"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
