import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/lib/services/auth.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await checkRateLimit(`forgot-password:${ip}`);
    if (!success) {
      return apiError("Too many attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);
    await requestPasswordReset(email);

    // Always return the same response to avoid revealing whether an
    // account exists for this email address.
    return apiSuccess({
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
