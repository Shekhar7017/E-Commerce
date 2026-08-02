import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { updateCategory, deleteCategory } from "@/lib/services/category.service";
import { categorySchema } from "@/lib/validators";
import { deleteImage } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import { ApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = categorySchema.partial().parse(body);
    const category = await updateCategory(id, input);
    return apiSuccess(category);
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

    await connectDB();
    const existing = await Category.findById(id);
    if (!existing) throw new ApiError("Category not found", 404);

    const publicId = existing.image?.publicId;
    await deleteCategory(id);

    if (publicId) {
      await deleteImage(publicId).catch((err) =>
        console.error("[CLOUDINARY_CLEANUP_FAILED]", err)
      );
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
