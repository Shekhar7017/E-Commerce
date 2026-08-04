"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validators";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";

export function CategoryForm({
  initialData,
  categoryId,
}: {
  initialData?: Partial<CategoryInput>;
  categoryId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<UploadedImage[]>(
    initialData?.image ? [{ ...initialData.image, isPrimary: true }] : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
      displayOrder: initialData?.displayOrder ?? 0,
    },
  });

  async function onSubmit(data: CategoryInput) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        image: image[0] ? { url: image[0].url, publicId: image[0].publicId } : undefined,
      };
      const url = categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories";
      const method = categoryId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(categoryId ? "Category updated" : "Category created");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
          Cover Image
        </label>
        <ImageUploader images={image} onChange={setImage} folder="categories" multiple={false} />
      </div>

      <div>
        <label htmlFor="name" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
          Name
        </label>
        <input id="name" {...register("name")} className="input-field" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
          Description
        </label>
        <textarea id="description" {...register("description")} rows={3} className="input-field resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="displayOrder" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Display Order
          </label>
          <input id="displayOrder" type="number" {...register("displayOrder")} className="input-field" />
        </div>
        <label className="flex items-center gap-2 text-sm mt-6">
          <input type="checkbox" {...register("isActive")} /> Active
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : categoryId ? (
          "Save Changes"
        ) : (
          "Create Category"
        )}
      </button>
    </form>
  );
}
