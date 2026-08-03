import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const category = await Category.findById(id).lean();
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit Category" description={category.name} />
      <CategoryForm
        initialData={JSON.parse(JSON.stringify(category))}
        categoryId={id}
      />
    </div>
  );
}
