"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: { name: string; slug: string; _id: string }[];
  brands: string[];
}

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 – ₹50,000", min: 15000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: undefined },
];

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-ink/10 dark:border-ivory/10 py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-medium"
      >
        {title}
        <ChevronDown
          size={16}
          className={cn("transition-transform", open ? "rotate-180" : "")}
        />
      </button>
      {open && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const activeMin = searchParams.get("minPrice");
  const activeMax = searchParams.get("maxPrice");

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <FilterGroup title="Category">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => updateParam("category", cat._id)}
            className={cn(
              "block text-sm text-left w-full py-1 transition-colors",
              activeCategory === cat._id
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-ink/70 dark:text-ivory/70 hover:text-emerald-500"
            )}
          >
            {cat.name}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_RANGES.map((range) => {
          const isActive =
            activeMin === String(range.min) &&
            activeMax === (range.max ? String(range.max) : null);
          return (
            <button
              key={range.label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (isActive) {
                  params.delete("minPrice");
                  params.delete("maxPrice");
                } else {
                  params.set("minPrice", String(range.min));
                  if (range.max) params.set("maxPrice", String(range.max));
                  else params.delete("maxPrice");
                }
                params.delete("page");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className={cn(
                "block text-sm text-left w-full py-1 transition-colors",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-ink/70 dark:text-ivory/70 hover:text-emerald-500"
              )}
            >
              {range.label}
            </button>
          );
        })}
      </FilterGroup>

      {brands.length > 0 && (
        <FilterGroup title="Brand">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => updateParam("brand", brand)}
              className={cn(
                "block text-sm text-left w-full py-1 transition-colors",
                activeBrand === brand
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-ink/70 dark:text-ivory/70 hover:text-emerald-500"
              )}
            >
              {brand}
            </button>
          ))}
        </FilterGroup>
      )}

      {(activeCategory || activeBrand || activeMin) && (
        <button
          onClick={() => router.push(pathname)}
          className="mt-5 text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50 hover:text-emerald-500"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
