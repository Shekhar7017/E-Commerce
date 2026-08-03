import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="label-eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-8">Privacy Policy</h1>
      <div className="tape-divider mb-10" />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm text-ink/70 dark:text-ivory/70 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">Information We Collect</h2>
        <p>
          We collect information you provide directly — name, email,
          shipping addresses, and payment details processed securely through
          Razorpay — along with order history and browsing activity on our
          site to improve your shopping experience.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">How We Use Your Information</h2>
        <p>
          We use your information to process orders, communicate order
          status, respond to support requests, and, with your consent, send
          occasional updates about new collections and offers.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">Payment Security</h2>
        <p>
          We never store your card details. All payments are processed
          through Razorpay, a PCI-DSS compliant payment gateway.
        </p>

        <h2 className="font-display text-xl text-ink dark:text-ivory">Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your
          personal data at any time by contacting us at
          hello@latelier.com.
        </p>
      </div>
    </main>
  );
}
