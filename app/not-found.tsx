import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="label-eyebrow mb-6">Error 404</p>
      <h1 className="font-display text-6xl md:text-8xl tracking-tightest">
        Lost the thread.
      </h1>
      <p className="mt-6 max-w-md text-ink/70 dark:text-ivory/70 text-lg">
        The page you&apos;re looking for has been discontinued or never
        existed in our collection.
      </p>
      <div className="tape-divider mt-10 max-w-xs" />
      <Link href="/" className="btn-primary mt-10">
        Return to the Atelier
      </Link>
    </main>
  );
}
