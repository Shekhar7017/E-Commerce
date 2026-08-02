import { connectDB } from "@/lib/db";
import { Order, Product, User } from "@/models";

export async function getDashboardSummary() {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalRevenueAgg,
    thisMonthRevenueAgg,
    lastMonthRevenueAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled"] },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled"] },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({}),
    Order.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    }),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total ?? 0;
  const thisMonthRevenue = thisMonthRevenueAgg[0]?.total ?? 0;
  const lastMonthRevenue = lastMonthRevenueAgg[0]?.total ?? 0;
  const revenueGrowthPercent =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : thisMonthRevenue > 0
      ? 100
      : 0;

  return {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    revenueGrowthPercent,
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
  };
}

export async function getRevenueTrend(months = 6) {
  await connectDB();
  const now = new Date();
  const results: { month: string; revenue: number; orders: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const agg = await Order.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled"] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
    ]);

    results.push({
      month: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      revenue: agg[0]?.revenue ?? 0,
      orders: agg[0]?.orders ?? 0,
    });
  }

  return results;
}

export async function getTopSellingProducts(limit = 10) {
  await connectDB();
  return Product.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .select("name slug images soldCount stock finalPrice")
    .lean();
}

export async function getOrderStatusBreakdown() {
  await connectDB();
  const results = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const breakdown: Record<string, number> = {};
  for (const r of results) {
    breakdown[r._id] = r.count;
  }
  return breakdown;
}
