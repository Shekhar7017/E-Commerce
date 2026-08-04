import { connectDB } from "@/lib/db";
import { User, Order } from "@/models";
import { ApiError } from "@/lib/api-response";
import type { AddressInput } from "@/lib/validators";
import { paginationMeta } from "@/lib/utils";
import { Types } from "mongoose";

export async function addAddress(userId: string, input: AddressInput) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  if (input.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    ...input,
    isDefault: input.isDefault || user.addresses.length === 0,
  });
  await user.save();
  return user.addresses;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: Partial<AddressInput>
) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError("Address not found", 404);

  if (input.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, input);
  await user.save();
  return user.addresses;
}

export async function deleteAddress(userId: string, addressId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError("Address not found", 404);

  const wasDefault = address.isDefault;
  user.addresses.pull(addressId);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
}

export async function toggleWishlist(userId: string, productId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  let added: boolean;

  if (index >= 0) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(new Types.ObjectId(productId));
    added = true;
  }

  await user.save();
  return { added, wishlist: user.wishlist };
}

export async function getWishlist(userId: string) {
  await connectDB();
  const user = await User.findById(userId).populate({
    path: "wishlist",
    match: { isActive: true },
    select: "name slug price finalPrice discountPercent images stock ratingAverage",
  });
  if (!user) throw new ApiError("User not found", 404);
  return user.wishlist;
}

export async function listCustomers(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  await connectDB();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = { role: "customer" };
  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Single aggregation for order stats across just this page's users,
  // instead of 2 queries per user (previously up to 200 queries for a
  // 100-row page).
  const userIds = items.map((u) => u._id);
  const statsAgg = await Order.aggregate([
    {
      $match: {
        user: { $in: userIds },
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
  ]);

  const statsByUserId = new Map(
    statsAgg.map((row) => [row._id.toString(), row])
  );

  const withStats = items.map((user) => {
    const stats = statsByUserId.get(user._id.toString());
    return {
      ...user,
      orderCount: stats?.orderCount ?? 0,
      totalSpent: stats?.totalSpent ?? 0,
    };
  });

  return { items: withStats, meta: paginationMeta(totalItems, page, limit) };
}

export async function toggleCustomerActive(userId: string, isActive: boolean) {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select("-password");
  if (!user) throw new ApiError("User not found", 404);
  return user;
}
