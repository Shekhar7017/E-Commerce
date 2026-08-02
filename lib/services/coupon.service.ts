import { connectDB } from "@/lib/db";
import { Coupon, Order } from "@/models";
import { ApiError } from "@/lib/api-response";
import type { CouponInput } from "@/lib/validators";

export async function validateCoupon(
  code: string,
  userId: string,
  cartSubtotal: number
) {
  await connectDB();
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon || !coupon.isActive) {
    throw new ApiError("Invalid or inactive coupon code", 404);
  }

  const now = new Date();
  if (now < coupon.startsAt) {
    throw new ApiError("This coupon is not active yet", 400);
  }
  if (now > coupon.expiresAt) {
    throw new ApiError("This coupon has expired", 400);
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError("This coupon has reached its usage limit", 400);
  }
  if (cartSubtotal < coupon.minOrderValue) {
    throw new ApiError(
      `This coupon requires a minimum order value of ₹${coupon.minOrderValue}`,
      400
    );
  }

  const userUsageCount = await Order.countDocuments({
    user: userId,
    couponCode: coupon.code,
    status: { $nin: ["cancelled"] },
  });
  if (userUsageCount >= coupon.perUserLimit) {
    throw new ApiError("You have already used this coupon", 400);
  }

  let discount =
    coupon.discountType === "percentage"
      ? (cartSubtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }
  discount = Math.min(discount, cartSubtotal);

  return {
    coupon,
    discount: Math.round(discount),
  };
}

export async function incrementCouponUsage(code: string) {
  await connectDB();
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
}

export async function decrementCouponUsage(code: string) {
  await connectDB();
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usedCount: -1 } }
  );
}

export async function listCoupons() {
  await connectDB();
  return Coupon.find().sort({ createdAt: -1 }).lean();
}

export async function createCoupon(input: CouponInput) {
  await connectDB();
  const existing = await Coupon.exists({ code: input.code.toUpperCase() });
  if (existing) throw new ApiError("A coupon with this code already exists", 409);
  return Coupon.create({ ...input, code: input.code.toUpperCase() });
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  await connectDB();
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new ApiError("Coupon not found", 404);

  if (input.code && input.code.toUpperCase() !== coupon.code) {
    const existing = await Coupon.exists({
      code: input.code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existing) throw new ApiError("A coupon with this code already exists", 409);
  }

  Object.assign(coupon, input, {
    code: input.code ? input.code.toUpperCase() : coupon.code,
  });
  await coupon.save();
  return coupon;
}

export async function deleteCoupon(id: string) {
  await connectDB();
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new ApiError("Coupon not found", 404);
  return coupon;
}
