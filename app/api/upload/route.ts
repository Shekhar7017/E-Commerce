import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { uploadImageBuffer } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "misc";

    if (!(file instanceof File)) {
      return apiError("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Only JPEG, PNG, WEBP, and AVIF images are allowed", 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError("File size must be under 5MB", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer(buffer, folder);

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
