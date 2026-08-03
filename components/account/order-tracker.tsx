import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/models";

const TRACK_STEPS: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered"];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400 capitalize">
        This order was {status}.
      </div>
    );
  }

  const currentIndex = TRACK_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {TRACK_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs",
                i <= currentIndex
                  ? "border-emerald-500 bg-emerald-500 text-ivory"
                  : "border-ink/20 dark:border-ivory/20 text-ink/30 dark:text-ivory/30"
              )}
            >
              {i <= currentIndex ? <Check size={14} /> : i + 1}
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-wide text-ink/50 dark:text-ivory/50 capitalize">
              {step}
            </span>
          </div>
          {i < TRACK_STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 mb-5",
                i < currentIndex ? "bg-emerald-500" : "bg-ink/10 dark:bg-ivory/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
