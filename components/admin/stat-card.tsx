import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6",
        accent
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-ink/10 dark:border-ivory/10"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50">
          {label}
        </span>
        <Icon size={18} className="text-emerald-500" />
      </div>
      <p className="font-display text-2xl">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
          )}
        >
          {trend.positive ? "+" : ""}
          {trend.value}% vs last month
        </p>
      )}
    </div>
  );
}
