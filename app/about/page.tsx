import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Atelier",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="label-eyebrow mb-3">Our Story</p>
      <h1 className="font-display text-4xl md:text-5xl mb-8">
        A boutique built on restraint.
      </h1>
      <div className="tape-divider mb-10" />
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-ink/70 dark:text-ivory/70 leading-relaxed">
        <p>
          L&apos;Atelier Haute Boutique was founded on a simple conviction:
          that a wardrobe of fewer, better things serves us more than a
          wardrobe of many forgettable ones. We are a single-vendor
          boutique — every piece in our collection is selected, sourced, and
          quality-checked by our own team, not aggregated from a marketplace
          of third-party sellers.
        </p>
        <p>
          Each season, our atelier curates a limited edit of apparel,
          accessories, and objects. We favor craftsmanship over volume,
          and we stand behind everything we sell with the same care a
          tailor gives a bespoke commission.
        </p>
        <p>
          We ship across India with tracked delivery, transparent pricing,
          and a straightforward returns policy. If something isn&apos;t
          right, our team is a message away.
        </p>
      </div>
    </main>
  );
}
