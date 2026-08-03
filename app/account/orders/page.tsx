import Link from "next/link";
import { auth } from "@/lib/auth";
import { listUserOrders } from "@/lib/services/order.service";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const session = await auth();
  const { items } = await listUserOrders(session!.user.id, 1, 20);

  if (items.length === 0) {
    return (
      <div>
        <h2 className="font-display text-2xl mb-6">Order History</h2>
        <p className="text-sm text-ink/60 dark:text-ivory/60">
          You haven&apos;t placed any orders yet.
        </p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Order History</h2>
      <div className="space-y-4">
        {items.map((order) => (
          <Link
            key={order.orderNumber}
            href={`/account/orders/${order.orderNumber}`}
            className="block rounded-lg border border-ink/10 dark:border-ivory/10 p-5 hover:border-emerald-500 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm">{order.orderNumber}</p>
                <p className="text-xs text-ink/50 dark:text-ivory/50 mt-1">
                  {formatDate(order.createdAt)} · {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
