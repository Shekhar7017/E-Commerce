import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="Add Category" />
      <CategoryForm />
    </div>
  );
}
