import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { registerSchema } from "@/lib/validators";
import { registerUser } from "@/lib/services/auth.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await checkRateLimit(`register:${ip}`);
    if (!success) {
      return apiError("Too many attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);

    return apiSuccess(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
