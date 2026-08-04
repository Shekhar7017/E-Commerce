"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validators";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";

interface CategoryOption {
  _id: string;
  name: string;
}

export function ProductForm({
  categories,
  initialData,
  productId,
}: {
  categories: CategoryOption[];
  initialData?: Partial<ProductInput> & { images: UploadedImage[] };
  productId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(initialData?.images ?? []);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      brand: initialData?.brand ?? "",
      category: initialData?.category ?? categories[0]?._id ?? "",
      description: initialData?.description ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      specifications: initialData?.specifications ?? [],
      price: initialData?.price ?? 0,
      discountPercent: initialData?.discountPercent ?? 0,
      stock: initialData?.stock ?? 0,
      lowStockThreshold: initialData?.lowStockThreshold ?? 5,
      tags: initialData?.tags ?? [],
      isFeatured: initialData?.isFeatured ?? false,
      isBestseller: initialData?.isBestseller ?? false,
      isNewArrival: initialData?.isNewArrival ?? true,
      isActive: initialData?.isActive ?? true,
      images: initialData?.images ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "specifications" });
  const tags = watch("tags");

  function addTag() {
    if (!tagInput.trim()) return;
    setValue("tags", [...(tags ?? []), tagInput.trim()]);
    setTagInput("");
  }

  function removeTag(index: number) {
    setValue("tags", (tags ?? []).filter((_, i) => i !== index));
  }

  async function onSubmit(data: ProductInput) {
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...data, images };
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(productId ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <section>
        <h2 className="font-display text-lg mb-4">Images</h2>
        <ImageUploader images={images} onChange={setImages} folder="products" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Product Name
          </label>
          <input id="name" {...register("name")} className="input-field" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="sku" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            SKU
          </label>
          <input id="sku" {...register("sku")} className="input-field" />
          {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
        </div>

        <div>
          <label htmlFor="brand" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Brand
          </label>
          <input id="brand" {...register("brand")} className="input-field" />
          {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Category
          </label>
          <select id="category" {...register("category")} className="input-field">
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="shortDescription" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Short Description
          </label>
          <input id="shortDescription" {...register("shortDescription")} className="input-field" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Full Description
          </label>
          <textarea id="description" {...register("description")} rows={5} className="input-field resize-none" />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="price" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Price (₹)
          </label>
          <input id="price" type="number" step="1" {...register("price")} className="input-field" />
        </div>
        <div>
          <label htmlFor="discountPercent" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Discount %
          </label>
          <input id="discountPercent" type="number" {...register("discountPercent")} className="input-field" />
        </div>
        <div>
          <label htmlFor="stock" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Stock
          </label>
          <input id="stock" type="number" {...register("stock")} className="input-field" />
        </div>
        <div>
          <label htmlFor="lowStockThreshold" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Low Stock Alert
          </label>
          <input id="lowStockThreshold" type="number" {...register("lowStockThreshold")} className="input-field" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Specifications</h2>
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`specifications.${index}.key`)}
                placeholder="Material"
                aria-label={`Specification ${index + 1} name`}
                className="input-field"
              />
              <input
                {...register(`specifications.${index}.value`)}
                placeholder="100% Silk"
                aria-label={`Specification ${index + 1} value`}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="shrink-0 text-ink/40 hover:text-red-500"
                aria-label="Remove specification row"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg mb-3">Tags</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            aria-label="Add a tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            className="input-field"
          />
          <button type="button" onClick={addTag} className="btn-secondary shrink-0 !px-4">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(tags ?? []).map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-ink/5 dark:bg-ivory/10 px-3 py-1 text-xs"
            >
              {tag}
              <button type="button" onClick={() => removeTag(i)} aria-label={`Remove tag ${tag}`}>
                <Trash2 size={10} />
              </button>
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isFeatured")} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isBestseller")} /> Bestseller
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isNewArrival")} /> New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isActive")} /> Active (visible on storefront)
        </label>
      </section>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : productId ? (
          "Save Changes"
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}
