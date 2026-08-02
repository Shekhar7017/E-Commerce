import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-response";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("You must be signed in to do this", 401);
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ApiError("You are not authorized to do this", 403);
  }
  return user;
}
