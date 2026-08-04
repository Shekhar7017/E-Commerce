"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { addressSchema, type AddressInput } from "@/lib/validators";
import type { AddressOption } from "@/components/checkout/address-selector";

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  async function loadAddresses() {
    setIsLoading(true);
    const res = await fetch("/api/addresses");
    const json = await res.json();
    if (json.success) setAddresses(json.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function onSubmit(data: AddressInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setAddresses(json.data);
      toast.success("Address added");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setAddresses(json.data);
      toast.success("Address deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete address");
    }
  }

  async function handleSetDefault(addressId: string) {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setAddresses(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update address");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Address Book</h2>
        <button onClick={() => setShowForm((v) => !v)} className="btn-secondary text-sm">
          <Plus size={14} /> Add Address
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-ink/10 dark:border-ivory/10 p-6"
        >
          <input {...register("label")} placeholder="Label (Home, Work)" aria-label="Label (Home, Work)" className="input-field" />
          <input {...register("fullName")} placeholder="Full name" aria-label="Full name" className="input-field" />
          <input {...register("phone")} placeholder="Phone" aria-label="Phone" className="input-field" />
          <input {...register("line1")} placeholder="Address line 1" aria-label="Address line 1" className="input-field" />
          <input {...register("line2")} placeholder="Address line 2 (optional)" aria-label="Address line 2 (optional)" className="input-field" />
          <input {...register("city")} placeholder="City" aria-label="City" className="input-field" />
          <input {...register("state")} placeholder="State" aria-label="State" className="input-field" />
          <input {...register("postalCode")} placeholder="Postal code" aria-label="Postal code" className="input-field" />
          <input {...register("country")} placeholder="Country" aria-label="Country" defaultValue="India" className="input-field" />

          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" {...register("isDefault")} id="isDefault" />
            <label htmlFor="isDefault" className="text-sm">
              Set as default address
            </label>
          </div>

          {Object.values(errors).length > 0 && (
            <p className="sm:col-span-2 text-xs text-red-500">
              Please check the fields above.
            </p>
          )}

          <div className="sm:col-span-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No saved addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="rounded-lg border border-ink/10 dark:border-ivory/10 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  {addr.label}
                </span>
                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      aria-label="Set default"
                      className="text-ink/30 hover:text-gold-deep dark:hover:text-gold"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    aria-label="Delete"
                    className="text-ink/30 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium">{addr.fullName}</p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                {addr.postalCode}
              </p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">{addr.phone}</p>
              {addr.isDefault && (
                <span className="mt-2 inline-block text-[10px] text-gold-deep dark:text-gold">
                  Default Address
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
