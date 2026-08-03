"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) setCustomers(json.data.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadCustomers(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadCustomers]);

  return (
    <div>
      <AdminPageHeader title="Customers" description="View and manage customer accounts." />

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-field !rounded-full pl-10"
        />
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 dark:border-ivory/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-ivory/10 text-left text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-ink/5 dark:border-ivory/5 last:border-0 hover:bg-ink/5 dark:hover:bg-ivory/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer._id}`}
                      className="font-medium hover:text-emerald-500"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60 dark:text-ivory/60">{customer.email}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(customer.createdAt)}</td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs",
                        customer.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      )}
                    >
                      {customer.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
