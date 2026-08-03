"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@/models";

interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string } | null;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
}

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
    (searchParams.get("status") as OrderStatus) || "all"
  );

  const loadOrders = useCallback(async (status: string, searchTerm: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) setOrders(json.data.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadOrders(statusFilter, search), 300);
    return () => clearTimeout(timeout);
  }, [statusFilter, search, loadOrders]);

  return (
    <div>
      <AdminPageHeader title="Orders" description="Manage and fulfill customer orders." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
            className="input-field !rounded-full pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs capitalize transition-colors",
                statusFilter === status
                  ? "bg-emerald-600 text-ivory"
                  : "border border-ink/15 dark:border-ivory/20 text-ink/70 dark:text-ivory/70"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 dark:border-ivory/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-ivory/10 text-left text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-ink/5 dark:border-ivory/5 last:border-0 hover:bg-ink/5 dark:hover:bg-ivory/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="font-mono text-xs hover:text-emerald-500"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.user?.name ?? "—"}</p>
                    <p className="text-xs text-ink/50 dark:text-ivory/50">
                      {order.user?.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 uppercase text-xs">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin text-emerald-500" />}>
      <AdminOrdersContent />
    </Suspense>
  );
}
