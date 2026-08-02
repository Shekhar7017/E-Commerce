import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product.service";
import { productSchema } from "@/lib/validators";
import { deleteImages } from "@/lib/cloudinary";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = productSchema.partial().parse(body);
    const product = await updateProduct(id, input);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    const publicIds = product.images.map((img) => img.publicId);

    await deleteProduct(id);
    await deleteImages(publicIds).catch((err) =>
      console.error("[CLOUDINARY_CLEANUP_FAILED]", err)
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
