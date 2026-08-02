"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL_ERROR]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-ivory text-ink dark:bg-ink dark:text-ivory font-body antialiased">
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest2 text-emerald-500 mb-6">
            Error 500
          </p>
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight">
            A seam has come loose.
          </h1>
          <p className="mt-6 max-w-md text-ink/70 dark:text-ivory/70 text-lg">
            Something went wrong on our end. Our atelier has been notified.
          </p>
          <button
            onClick={reset}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium tracking-wide text-ivory transition-all duration-300 hover:bg-emerald-700"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
