import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="mx-auto max-w-lg px-6 py-32 text-center">
      <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={56} />
      <p className="label-eyebrow mb-3">Order Confirmed</p>
      <h1 className="font-display text-4xl mb-4">Thank you.</h1>
      <p className="text-ink/60 dark:text-ivory/60 mb-2">
        Your order has been placed successfully.
      </p>
      {order && (
        <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400 mb-10">
          {order}
        </p>
      )}
      <div className="flex items-center justify-center gap-4 mt-8">
        {order && (
          <Link href={`/account/orders/${order}`} className="btn-primary">
            Track Order
          </Link>
        )}
        <Link href="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
