import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import { listCoupons, createCoupon } from "@/lib/services/coupon.service";
import { couponSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await listCoupons();
    return apiSuccess(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = couponSchema.parse(body);
    const coupon = await createCoupon(input);
    return apiSuccess(coupon, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
