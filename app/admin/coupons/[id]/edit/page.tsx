import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const coupon = await Coupon.findById(id).lean();
  if (!coupon) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit Coupon" description={coupon.code} />
      <CouponForm initialData={JSON.parse(JSON.stringify(coupon))} couponId={id} />
    </div>
  );
}
