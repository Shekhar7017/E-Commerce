"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, cn } from "@/lib/utils";

interface AdminReview {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; slug: string };
}

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");

  async function loadReviews(status: string) {
    setIsLoading(true);
    try {
      const params = status === "all" ? "" : `?status=${status}`;
      const res = await fetch(`/api/admin/reviews${params}`);
      const json = await res.json();
      if (json.success) setReviews(json.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews(filter);
  }, [filter]);

  async function handleModerate(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success(`Review ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update review");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete review");
    }
  }

  return (
    <div>
      <AdminPageHeader title="Reviews" description="Moderate customer reviews before they go live." />

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs capitalize transition-colors",
              filter === f
                ? "bg-emerald-600 text-ivory"
                : "border border-ink/15 dark:border-ivory/20 text-ink/70 dark:text-ivory/70"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500" />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-ink/60 dark:text-ivory/60">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-lg border border-ink/10 dark:border-ivory/10 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link
                    href={`/product/${review.product.slug}`}
                    target="_blank"
                    className="text-sm font-medium hover:text-emerald-500"
                  >
                    {review.product.name}
                  </Link>
                  <p className="text-xs text-ink/50 dark:text-ivory/50">
                    {review.user.name} ({review.user.email}) · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={
                        i < review.rating ? "fill-gold text-gold" : "text-ink/20 dark:text-ivory/20"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm font-medium">{review.title}</p>
              <p className="text-sm text-ink/70 dark:text-ivory/70 mt-1">{review.comment}</p>

              <div className="flex items-center gap-3 mt-4">
                {review.status !== "approved" && (
                  <button
                    onClick={() => handleModerate(review._id, "approved")}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    <Check size={13} /> Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() => handleModerate(review._id, "rejected")}
                    className="inline-flex items-center gap-1 text-xs text-gold-deep dark:text-gold"
                  >
                    <X size={13} /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="inline-flex items-center gap-1 text-xs text-red-500"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
