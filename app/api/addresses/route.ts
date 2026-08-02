import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { addAddress } from "@/lib/services/user.service";
import { addressSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const dbUser = await User.findById(user.id).select("addresses");
    return apiSuccess(dbUser?.addresses ?? []);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = addressSchema.parse(body);
    const addresses = await addAddress(user.id, input);
    return apiSuccess(addresses, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
