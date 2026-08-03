"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressOption {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function AddressSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAddresses(json.data);
          const defaultAddr = json.data.find((a: AddressOption) => a.isDefault);
          if (defaultAddr) onSelect(defaultAddr._id);
          else if (json.data[0]) onSelect(json.data[0]._id);
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loader2 className="animate-spin text-emerald-500" size={20} />;
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 dark:border-ivory/20 p-6 text-center">
        <p className="text-sm text-ink/60 dark:text-ivory/60 mb-4">
          You don&apos;t have a saved address yet.
        </p>
        <Link href="/account/addresses" className="btn-secondary text-sm">
          <Plus size={14} /> Add an Address
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <button
          key={addr._id}
          onClick={() => onSelect(addr._id)}
          className={cn(
            "w-full text-left rounded-lg border p-4 transition-colors",
            selectedId === addr._id
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-ink/15 dark:border-ivory/20 hover:border-ink/30"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {addr.label}
            </span>
            {addr.isDefault && (
              <span className="text-[10px] text-ink/40 dark:text-ivory/40">Default</span>
            )}
          </div>
          <p className="text-sm font-medium">{addr.fullName}</p>
          <p className="text-sm text-ink/60 dark:text-ivory/60">
            {addr.line1}
            {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
            {addr.postalCode}
          </p>
          <p className="text-sm text-ink/60 dark:text-ivory/60">{addr.phone}</p>
        </button>
      ))}
      <Link
        href="/account/addresses"
        className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
      >
        <Plus size={12} /> Add another address
      </Link>
    </div>
  );
}
