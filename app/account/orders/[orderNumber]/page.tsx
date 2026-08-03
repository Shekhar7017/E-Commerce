"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTracker } from "@/components/account/order-tracker";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItem {
  product: { slug: string } | string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetail {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
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
  shippingFee: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setIsLoading(false));
  }, [params.orderNumber]);

  async function handleCancel() {
    if (!confirm("Cancel this order?")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${params.orderNumber}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setOrder(json.data);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel order");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <Loader2 className="animate-spin text-emerald-500" />;
  }

  if (!order) {
    return <p className="text-sm text-ink/60 dark:text-ivory/60">Order not found.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-sm">{order.orderNumber}</p>
          <p className="text-xs text-ink/50 dark:text-ivory/50">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status as never} />
          <a
            href={`/api/orders/${order.orderNumber}/invoice`}
            className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <Download size={12} /> Invoice
          </a>
        </div>
      </div>

      <div className="mb-10">
        <OrderTracker status={order.status as never} />
      </div>

      <div className="space-y-4 mb-10">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 border-b border-ink/10 dark:border-ivory/10 pb-4">
            <Link
              href={`/product/${item.slug}`}
              className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-ink/5 dark:bg-ivory/5"
            >
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              )}
            </Link>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-ink/50 dark:text-ivory/50">Qty: {item.quantity}</p>
            </div>
            <span className="font-mono text-sm">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-display text-lg mb-3">Delivery Address</h3>
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

        <div>
          <h3 className="font-display text-lg mb-3">Payment Summary</h3>
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
            <p className="text-xs text-ink/50 dark:text-ivory/50 pt-2 uppercase">
              {order.paymentMethod} · {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>

      {["pending", "paid"].includes(order.status) && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="btn-secondary mt-10 text-sm"
        >
          {isCancelling ? <Loader2 size={14} className="animate-spin" /> : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
