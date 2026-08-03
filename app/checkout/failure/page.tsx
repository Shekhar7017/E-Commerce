import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-32 text-center">
      <XCircle className="mx-auto text-red-500 mb-6" size={56} />
      <p className="label-eyebrow mb-3">Payment Unsuccessful</p>
      <h1 className="font-display text-4xl mb-4">Something went wrong.</h1>
      <p className="text-ink/60 dark:text-ivory/60 mb-10">
        Your payment could not be completed. No amount has been charged, or
        it will be automatically refunded within 5-7 business days.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/checkout" className="btn-primary">
          Try Again
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact Support
        </Link>
      </div>
    </main>
  );
}
