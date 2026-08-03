"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function RevenueTrendChart({
  data,
}: {
  data: { month: string; revenue: number; orders: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0B6E4F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0B6E4F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.3} />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="currentColor"
          strokeOpacity={0.3}
          tickFormatter={(v) => `₹${v / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            background: "var(--toast-bg)",
            border: "1px solid var(--toast-border)",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0B6E4F"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
