"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface AdminCoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCoupons(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success("Coupon deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete coupon");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Create and manage discount codes."
        action={
          <Link href="/admin/coupons/new" className="btn-primary text-sm">
            <Plus size={16} /> Add Coupon
          </Link>
        }
      />

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : coupons.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No coupons created yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 dark:border-ivory/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-ivory/10 text-left text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-ink/5 dark:border-ivory/5 last:border-0">
                  <td className="px-4 py-3 font-mono">{coupon.code}</td>
                  <td className="px-4 py-3">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : formatCurrency(coupon.discountValue)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(coupon.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs",
                        coupon.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-ink/10 text-ink/50 dark:bg-ivory/10 dark:text-ivory/50"
                      )}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/coupons/${coupon._id}/edit`}
                        className="text-ink/50 hover:text-emerald-500"
                        aria-label={`Edit ${coupon.code}`}
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-ink/50 hover:text-red-500"
                        aria-label={`Delete ${coupon.code}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
