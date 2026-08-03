"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-2 mt-16">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 dark:border-ivory/20 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) => (
        <span key={page} className="flex items-center gap-2">
          {idx > 0 && pages[idx - 1] !== page - 1 && (
            <span className="text-ink/30 dark:text-ivory/30">…</span>
          )}
          <button
            onClick={() => goToPage(page)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
              page === currentPage
                ? "bg-emerald-600 text-ivory"
                : "hover:bg-ink/5 dark:hover:bg-ivory/5"
            )}
          >
            {page}
          </button>
        </span>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 dark:border-ivory/20 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
