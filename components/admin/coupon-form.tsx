"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { couponBaseSchema, type CouponInput } from "@/lib/validators";

function toDateInputValue(date?: string | Date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CouponForm({
  initialData,
  couponId,
}: {
  initialData?: Partial<CouponInput> & { startsAt?: string; expiresAt?: string };
  couponId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponBaseSchema),
    defaultValues: {
      code: initialData?.code ?? "",
      description: initialData?.description ?? "",
      discountType: initialData?.discountType ?? "percentage",
      discountValue: initialData?.discountValue ?? 10,
      maxDiscountAmount: initialData?.maxDiscountAmount,
      minOrderValue: initialData?.minOrderValue ?? 0,
      usageLimit: initialData?.usageLimit ?? 0,
      perUserLimit: initialData?.perUserLimit ?? 1,
      isActive: initialData?.isActive ?? true,
      startsAt: initialData?.startsAt
        ? new Date(initialData.startsAt)
        : new Date(),
      expiresAt: initialData?.expiresAt
        ? new Date(initialData.expiresAt)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  async function onSubmit(data: CouponInput) {
    setIsSubmitting(true);
    try {
      const url = couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons";
      const method = couponId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(couponId ? "Coupon updated" : "Coupon created");
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save coupon");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <label htmlFor="code" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
          Coupon Code
        </label>
        <input id="code" {...register("code")} className="input-field uppercase" />
        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
          Description
        </label>
        <input id="description" {...register("description")} className="input-field" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Discount Type
          </label>
          <select id="discountType" {...register("discountType")} className="input-field">
            <option value="percentage">Percentage</option>
            <option value="flat">Flat Amount</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Discount Value
          </label>
          <input id="discountValue" type="number" {...register("discountValue")} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxDiscountAmount" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Max Discount (₹)
          </label>
          <input id="maxDiscountAmount" type="number" {...register("maxDiscountAmount")} className="input-field" />
        </div>
        <div>
          <label htmlFor="minOrderValue" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Min Order Value (₹)
          </label>
          <input id="minOrderValue" type="number" {...register("minOrderValue")} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="usageLimit" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Total Usage Limit (0 = unlimited)
          </label>
          <input id="usageLimit" type="number" {...register("usageLimit")} className="input-field" />
        </div>
        <div>
          <label htmlFor="perUserLimit" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Per Customer Limit
          </label>
          <input id="perUserLimit" type="number" {...register("perUserLimit")} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Starts On
          </label>
          <input id="startsAt"
            type="date"
            defaultValue={toDateInputValue(initialData?.startsAt)}
            {...register("startsAt")}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="expiresAt" className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50 mb-1 block">
            Expires On
          </label>
          <input id="expiresAt"
            type="date"
            defaultValue={toDateInputValue(initialData?.expiresAt)}
            {...register("expiresAt")}
            className="input-field"
          />
          {errors.expiresAt && (
            <p className="mt-1 text-xs text-red-500">{errors.expiresAt.message}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} /> Active
      </label>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : couponId ? (
          "Save Changes"
        ) : (
          "Create Coupon"
        )}
      </button>
    </form>
  );
}
