import Link from "next/link";
import Image from "next/image";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueTrendChart } from "@/components/admin/revenue-trend-chart";
import {
  getDashboardSummary,
  getRevenueTrend,
  getTopSellingProducts,
} from "@/lib/services/analytics.service";
import { getLowStockProducts } from "@/lib/services/product.service";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [summary, revenueTrend, topProducts, lowStock] = await Promise.all([
    getDashboardSummary(),
    getRevenueTrend(6),
    getTopSellingProducts(5),
    getLowStockProducts(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of the atelier's performance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={IndianRupee}
          accent
        />
        <StatCard
          label="This Month"
          value={formatCurrency(summary.thisMonthRevenue)}
          icon={IndianRupee}
          trend={{
            value: Math.abs(summary.revenueGrowthPercent),
            positive: summary.revenueGrowthPercent >= 0,
          }}
        />
        <StatCard
          label="Total Orders"
          value={String(summary.totalOrders)}
          icon={ShoppingCart}
        />
        <StatCard
          label="Customers"
          value={String(summary.totalCustomers)}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 dark:border-ivory/10 p-6">
          <h2 className="font-display text-lg mb-6">Revenue — Last 6 Months</h2>
          <RevenueTrendChart data={revenueTrend} />
        </div>

        <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={16} className="text-gold" />
            <h2 className="font-display text-lg">Low Stock Alerts</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink/50 dark:text-ivory/50">
              All products are well stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 6).map((product) => (
                <Link
                  key={product._id.toString()}
                  href={`/admin/products/${product._id}/edit`}
                  className="flex items-center justify-between text-sm hover:text-emerald-500"
                >
                  <span className="line-clamp-1">{product.name}</span>
                  <span className="font-mono text-xs text-gold-deep dark:text-gold shrink-0 ml-2">
                    {product.stock} left
                  </span>
                </Link>
              ))}
            </div>
          )}
          {summary.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=pending"
              className="mt-6 block rounded-md bg-gold/10 p-3 text-xs text-gold-deep dark:text-gold"
            >
              {summary.pendingOrders} order(s) awaiting processing
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Package size={16} className="text-emerald-500" />
          <h2 className="font-display text-lg">Top Selling Products</h2>
        </div>
        <div className="space-y-4">
          {topProducts.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary) ?? product.images[0];
            return (
              <Link
                key={product._id.toString()}
                href={`/admin/products/${product._id}/edit`}
                className="flex items-center gap-4 hover:bg-ink/5 dark:hover:bg-ivory/5 rounded-md p-2 -mx-2 transition-colors"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5">
                  {primaryImage && (
                    <Image
                      src={primaryImage.url}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-ink/50 dark:text-ivory/50">
                    {product.soldCount} sold · {formatCurrency(product.finalPrice)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
