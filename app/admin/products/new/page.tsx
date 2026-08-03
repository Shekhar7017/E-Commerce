import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/services/category.service";

export default async function NewProductPage() {
  const categories = await listCategories(true);

  return (
    <div>
      <AdminPageHeader title="Add Product" description="Add a new piece to the catalog." />
      <ProductForm categories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
