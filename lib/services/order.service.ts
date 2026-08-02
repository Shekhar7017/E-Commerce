import { connectDB } from "@/lib/db";
import { Order, User } from "@/models";
import type { IOrderItem, IShippingAddress, OrderStatus } from "@/models";
import { ApiError } from "@/lib/api-response";
import { generateOrderNumber, paginationMeta } from "@/lib/utils";
import { decrementStock, restoreStock } from "@/lib/services/product.service";
import { validateCoupon, incrementCouponUsage } from "@/lib/services/coupon.service";
import { getCart, clearCart } from "@/lib/services/cart.service";

const SHIPPING_FEE = 0;
const TAX_RATE = 0;

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

interface BuildOrderParams {
  userId: string;
  addressId: string;
  paymentMethod: "razorpay" | "cod";
  couponCode?: string;
}

export async function buildOrderFromCart(params: BuildOrderParams) {
  await connectDB();
  const { userId, addressId, paymentMethod, couponCode } = params;

  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError("Delivery address not found", 404);

  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw new ApiError("Your cart is empty", 400);
  }

  const items: IOrderItem[] = cart.items.map((item) => {
    const product = item.product as unknown as {
      _id: string;
      name: string;
      slug: string;
      images: { url: string; isPrimary: boolean }[];
      sku: string;
      finalPrice: number;
      stock: number;
    };

    if (item.quantity > product.stock) {
      throw new ApiError(
        `${product.name} only has ${product.stock} unit(s) left in stock`,
        409
      );
    }

    const primaryImage =
      product.images.find((img) => img.isPrimary)?.url ??
      product.images[0]?.url ??
      "";

    return {
      product: product._id as unknown as IOrderItem["product"],
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      sku: product.sku,
      price: product.finalPrice,
      quantity: item.quantity,
      subtotal: product.finalPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  let discount = 0;
  let appliedCouponCode: string | undefined;
  if (couponCode) {
    const result = await validateCoupon(couponCode, userId, subtotal);
    discount = result.discount;
    appliedCouponCode = result.coupon.code;
  }

  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + SHIPPING_FEE + tax);

  const shippingAddress: IShippingAddress = {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };

  return {
    items,
    subtotal,
    discount,
    couponCode: appliedCouponCode,
    shippingFee: SHIPPING_FEE,
    tax,
    total,
    shippingAddress,
    paymentMethod,
  };
}

export async function createOrder(params: {
  userId: string;
  built: Awaited<ReturnType<typeof buildOrderFromCart>>;
  paymentStatus: "pending" | "paid";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}) {
  await connectDB();
  const { userId, built, paymentStatus, razorpayOrderId, razorpayPaymentId } =
    params;

  await decrementStock(
    built.items.map((i) => ({
      product: i.product.toString(),
      quantity: i.quantity,
    }))
  );

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items: built.items,
    shippingAddress: built.shippingAddress,
    subtotal: built.subtotal,
    discount: built.discount,
    couponCode: built.couponCode,
    shippingFee: built.shippingFee,
    tax: built.tax,
    total: built.total,
    paymentMethod: built.paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    status: paymentStatus === "paid" ? "paid" : "pending",
    statusHistory: [
      {
        status: paymentStatus === "paid" ? "paid" : "pending",
        changedAt: new Date(),
      },
    ],
  });

  if (built.couponCode) {
    await incrementCouponUsage(built.couponCode);
  }

  await clearCart(userId);

  return order;
}

export async function getOrderByNumber(orderNumber: string, userId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { orderNumber };
  if (userId) filter.user = userId;

  const order = await Order.findOne(filter).populate(
    "items.product",
    "name slug images"
  );
  if (!order) throw new ApiError("Order not found", 404);
  return order;
}

export async function listUserOrders(
  userId: string,
  page = 1,
  limit = 10
) {
  await connectDB();
  const filter = { user: userId };
  const [items, totalItems] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta(totalItems, page, limit) };
}

export async function listAllOrders(params: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}) {
  await connectDB();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.search) {
    filter.orderNumber = { $regex: params.search, $options: "i" };
  }

  const [items, totalItems] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, meta: paginationMeta(totalItems, page, limit) };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  options: { note?: string; trackingNumber?: string; carrier?: string } = {}
) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found", 404);

  const allowedNext = VALID_TRANSITIONS[order.status];
  if (!allowedNext.includes(newStatus)) {
    throw new ApiError(
      `Cannot transition order from "${order.status}" to "${newStatus}"`,
      400
    );
  }

  if (newStatus === "cancelled") {
    await restoreStock(
      order.items.map((i) => ({
        product: i.product.toString(),
        quantity: i.quantity,
      }))
    );
    order.cancelledAt = new Date();
    if (options.note) order.cancelReason = options.note;
  }

  if (newStatus === "delivered") {
    order.deliveredAt = new Date();
  }

  if (options.trackingNumber) order.trackingNumber = options.trackingNumber;
  if (options.carrier) order.carrier = options.carrier;

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    note: options.note,
    changedAt: new Date(),
  });

  await order.save();
  return order;
}

export async function cancelOwnOrder(
  orderId: string,
  userId: string,
  reason?: string
) {
  await connectDB();
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError("Order not found", 404);

  if (!["pending", "paid"].includes(order.status)) {
    throw new ApiError(
      "This order can no longer be cancelled. Please contact support.",
      400
    );
  }

  return updateOrderStatus(orderId, "cancelled", { note: reason });
}

export async function getRevenueAnalytics(fromDate: Date, toDate: Date) {
  await connectDB();
  const orders = await Order.find({
    createdAt: { $gte: fromDate, $lte: toDate },
    status: { $nin: ["cancelled"] },
  }).lean();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const byStatus: Record<string, number> = {};
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  return { totalRevenue, totalOrders, averageOrderValue, byStatus };
}

// Ensure Product import is retained for potential population/type usage
export type { IOrderItem };
