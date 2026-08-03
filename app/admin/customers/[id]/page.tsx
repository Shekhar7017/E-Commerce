"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/models";

interface CustomerDetail {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    addresses: { city: string; state: string }[];
  };
  orders: {
    _id: string;
    orderNumber: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }[];
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadCustomer() {
    const res = await fetch(`/api/admin/customers/${params.id}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleToggleActive() {
    if (!data) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !data.user.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setData({ ...data, user: { ...data.user, isActive: json.data.isActive } });
      toast.success(json.data.isActive ? "Account reactivated" : "Account suspended");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update account");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) return <Loader2 className="animate-spin text-emerald-500" />;
  if (!data) return <p className="text-sm text-ink/60 dark:text-ivory/60">Customer not found.</p>;

  return (
    <div>
      <AdminPageHeader
        title={data.user.name}
        description={data.user.email}
        action={
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className="btn-secondary text-sm"
          >
            {data.user.isActive ? "Suspend Account" : "Reactivate Account"}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-5">
          <p className="text-xs uppercase text-ink/50 dark:text-ivory/50 mb-1">Joined</p>
          <p className="text-sm">{formatDate(data.user.createdAt)}</p>
        </div>
        <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-5">
          <p className="text-xs uppercase text-ink/50 dark:text-ivory/50 mb-1">Phone</p>
          <p className="text-sm">{data.user.phone ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-5">
          <p className="text-xs uppercase text-ink/50 dark:text-ivory/50 mb-1">Orders</p>
          <p className="text-sm">{data.orders.length}</p>
        </div>
      </div>

      <h2 className="font-display text-lg mb-4">Recent Orders</h2>
      {data.orders.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {data.orders.map((order) => (
            <Link
              key={order.orderNumber}
              href={`/admin/orders/${order._id}`}
              className="flex items-center justify-between rounded-lg border border-ink/10 dark:border-ivory/10 p-4 hover:border-emerald-500"
            >
              <div>
                <p className="font-mono text-xs">{order.orderNumber}</p>
                <p className="text-xs text-ink/50 dark:text-ivory/50">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
