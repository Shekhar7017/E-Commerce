import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError, ApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { toggleCustomerActive } from "@/lib/services/user.service";
import { connectDB } from "@/lib/db";
import { User, Order } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();

    const user = await User.findOne({ _id: id, role: "customer" }).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    if (!user) throw new ApiError("Customer not found", 404);

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return apiSuccess({ user, orders });
  } catch (error) {
    return handleApiError(error);
  }
}

const toggleSchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { isActive } = toggleSchema.parse(body);

    const user = await toggleCustomerActive(id, isActive);
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
