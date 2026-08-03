"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/models";

const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

interface AdminOrderDetail {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  user: { name: string; email: string; phone?: string };
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  async function loadOrder() {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    const json = await res.json();
    if (json.success) {
      setOrder(json.data);
      setTrackingNumber(json.data.trackingNumber ?? "");
      setCarrier(json.data.carrier ?? "");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, trackingNumber, carrier }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setOrder(json.data);
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) return <Loader2 className="animate-spin text-emerald-500" />;
  if (!order) return <p className="text-sm text-ink/60 dark:text-ivory/60">Order not found.</p>;

  const nextOptions = NEXT_STATUS_OPTIONS[order.status];

  return (
    <div>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-lg mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-ink/10 dark:border-ivory/10 pb-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.name}</p>
                    <p className="text-xs text-ink/50 dark:text-ivory/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-sm">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg mb-4">Delivery Address</h2>
            <p className="text-sm text-ink/70 dark:text-ivory/70">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>

          {nextOptions.length > 0 && (
            <div>
              <h2 className="font-display text-lg mb-4">Update Status</h2>

              {(nextOptions.includes("shipped") || order.status === "shipped") && (
                <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
                  <input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Carrier"
                    className="input-field"
                  />
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Tracking number"
                    className="input-field"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {nextOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating}
                    className="btn-secondary text-sm capitalize"
                  >
                    Mark as {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-ink/10 dark:border-ivory/10 p-6 h-fit">
          <h2 className="font-display text-lg mb-4">Customer</h2>
          <p className="text-sm font-medium">{order.user.name}</p>
          <p className="text-sm text-ink/60 dark:text-ivory/60">{order.user.email}</p>
          {order.user.phone && (
            <p className="text-sm text-ink/60 dark:text-ivory/60">{order.user.phone}</p>
          )}

          <div className="tape-divider--dense my-5" />

          <h2 className="font-display text-lg mb-4">Payment</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-ivory/60">Subtotal</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs uppercase text-ink/50 dark:text-ivory/50">
            {order.paymentMethod} · {order.paymentStatus}
          </p>

          <Link
            href={`/api/admin/orders/${order._id}/invoice`}
            className="mt-6 inline-block text-xs text-emerald-600 dark:text-emerald-400"
          >
            Download Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}
