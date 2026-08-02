import { connectDB } from "@/lib/db";
import { Review, Order, Product } from "@/models";
import { ApiError } from "@/lib/api-response";
import type { ReviewInput } from "@/lib/validators";
import { paginationMeta } from "@/lib/utils";

async function recalculateProductRating(productId: string) {
  const approvedReviews = await Review.find({
    product: productId,
    status: "approved",
  }).lean();

  const ratingCount = approvedReviews.length;
  const ratingAverage =
    ratingCount > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    ratingCount,
    ratingAverage: Math.round(ratingAverage * 10) / 10,
  });
}

export async function createReview(userId: string, input: ReviewInput) {
  await connectDB();

  const order = await Order.findOne({
    _id: input.order,
    user: userId,
    status: "delivered",
    "items.product": input.product,
  });

  if (!order) {
    throw new ApiError(
      "You can only review products from delivered orders",
      403
    );
  }

  const existing = await Review.findOne({
    product: input.product,
    user: userId,
    order: input.order,
  });
  if (existing) {
    throw new ApiError("You have already reviewed this product for this order", 409);
  }

  const review = await Review.create({
    ...input,
    user: userId,
    isVerifiedPurchase: true,
    status: "pending",
  });

  return review;
}

export async function listProductReviews(
  productId: string,
  page = 1,
  limit = 10
) {
  await connectDB();
  const filter = { product: productId, status: "approved" };
  const [items, totalItems] = await Promise.all([
    Review.find(filter)
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta(totalItems, page, limit) };
}

export async function listReviewsForModeration(status?: string) {
  await connectDB();
  const filter = status ? { status } : {};
  return Review.find(filter)
    .populate("user", "name email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 })
    .lean();
}

export async function moderateReview(
  reviewId: string,
  status: "approved" | "rejected",
  adminReply?: string
) {
  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError("Review not found", 404);

  review.status = status;
  if (adminReply) review.adminReply = adminReply;
  await review.save();

  await recalculateProductRating(review.product.toString());
  return review;
}

export async function deleteReview(reviewId: string) {
  await connectDB();
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new ApiError("Review not found", 404);
  await recalculateProductRating(review.product.toString());
  return review;
}
