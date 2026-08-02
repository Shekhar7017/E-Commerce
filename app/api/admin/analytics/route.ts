import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/session";
import {
  getDashboardSummary,
  getRevenueTrend,
  getTopSellingProducts,
  getOrderStatusBreakdown,
} from "@/lib/services/analytics.service";
import { getLowStockProducts } from "@/lib/services/product.service";

export async function GET() {
  try {
    await requireAdmin();

    const [summary, revenueTrend, topProducts, statusBreakdown, lowStock] =
      await Promise.all([
        getDashboardSummary(),
        getRevenueTrend(6),
        getTopSellingProducts(5),
        getOrderStatusBreakdown(),
        getLowStockProducts(),
      ]);

    return apiSuccess({
      summary,
      revenueTrend,
      topProducts,
      statusBreakdown,
      lowStockProducts: lowStock.slice(0, 10),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
