import { apiSuccess, handleApiError } from "@/lib/api-response";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/product.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    const related = await getRelatedProducts(
      product._id.toString(),
      product.category._id.toString()
    );
    return apiSuccess(
      { product, related },
      200,
      { cache: "public, s-maxage=30, stale-while-revalidate=60" }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
