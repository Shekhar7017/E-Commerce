import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/models";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold/15 text-gold-deep dark:text-gold",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  delivered: "bg-emerald-600 text-ivory",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  refunded: "bg-ink/10 text-ink/60 dark:bg-ivory/10 dark:text-ivory/60",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
