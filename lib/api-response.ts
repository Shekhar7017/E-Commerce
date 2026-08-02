import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues.map((i) => i.message).join(", ");
    return apiError(message, 422);
  }

  if (error instanceof ApiError) {
    return apiError(error.message, error.statusCode);
  }

  if (error instanceof Error) {
    if (
      "code" in error &&
      (error as unknown as { code: number }).code === 11000
    ) {
      return apiError("A record with this value already exists", 409);
    }
    console.error("[API_ERROR]", error.message);
    return apiError("Something went wrong. Please try again.", 500);
  }

  console.error("[API_ERROR]", error);
  return apiError("Something went wrong. Please try again.", 500);
}
