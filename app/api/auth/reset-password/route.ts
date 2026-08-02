import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);
    await resetPassword(token, password);
    return apiSuccess({ message: "Password reset successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
