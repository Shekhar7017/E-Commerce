import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="label-eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-8">Terms of Service</h1>
      <div className="tape-divider mb-10" />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm text-ink/70 dark:text-ivory/70 leading-relaxed">
        <p>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">
          Orders and Payment
        </h2>
        <p>
          All orders placed through L&apos;Atelier Haute Boutique are subject
          to product availability. We accept payment via Razorpay (cards, UPI,
          net banking) and Cash on Delivery. Prices are listed in Indian
          Rupees (INR) and are inclusive of applicable taxes unless stated
          otherwise.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">
          Shipping and Delivery
        </h2>
        <p>
          We ship across India. Estimated delivery windows are provided at
          checkout and in your order confirmation email; actual delivery
          times may vary due to courier or logistics delays outside our
          control.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">
          Cancellations and Refunds
        </h2>
        <p>
          Orders may be cancelled prior to shipment from your account&apos;s
          order history. Once an order has shipped, please refer to our
          returns process by contacting support. Approved refunds are
          processed to the original payment method within 5-7 business days.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">
          Product Reviews
        </h2>
        <p>
          Reviews may only be submitted for products from orders marked as
          delivered, and are moderated before publication to maintain the
          quality and integrity of our storefront.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">
          Contact
        </h2>
        <p>
          For any questions regarding these terms, please reach us at
          hello@latelier.com.
        </p>
      </div>
    </main>
  );
}
