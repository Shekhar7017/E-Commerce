import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curated Luxury, Delivered",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="label-eyebrow mb-6">L&apos;Atelier Haute Boutique</p>
      <h1 className="font-display text-5xl md:text-7xl tracking-tightest leading-[1.05] max-w-4xl">
        Every stitch, considered.
      </h1>
      <p className="mt-6 max-w-xl text-ink/70 dark:text-ivory/70 text-lg">
        The full storefront — collections, catalog, and checkout — arrives in
        the next build phase.
      </p>
      <div className="tape-divider mt-12 max-w-md" />
    </main>
  );
}
