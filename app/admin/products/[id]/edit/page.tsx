import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/services/category.service";
import { getProductById } from "@/lib/services/product.service";
import { ApiError } from "@/lib/api-response";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProductById(id);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  const categories = await listCategories(true);
  const plainProduct = JSON.parse(JSON.stringify(product));

  return (
    <div>
      <AdminPageHeader title="Edit Product" description={product.name} />
      <ProductForm
        categories={JSON.parse(JSON.stringify(categories))}
        initialData={{
          ...plainProduct,
          category: plainProduct.category._id,
        }}
        productId={id}
      />
    </div>
  );
}
