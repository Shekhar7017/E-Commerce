"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  adminReply?: string;
  user: { name: string; image?: string };
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?product=${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setReviews(json.data.items);
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-ink/60 dark:text-ivory/60">
        No reviews yet. Be the first to share your thoughts after your order
        arrives.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-ink/10 dark:border-ivory/10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.rating
                      ? "fill-gold-deep text-gold-deep dark:fill-gold dark:text-gold"
                      : "text-ink/20 dark:text-ivory/20"
                  }
                />
              ))}
            </div>
            {review.isVerifiedPurchase && (
              <span className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Verified Purchase
              </span>
            )}
          </div>
          <h4 className="font-medium text-sm">{review.title}</h4>
          <p className="mt-1 text-sm text-ink/70 dark:text-ivory/70 leading-relaxed">
            {review.comment}
          </p>
          <p className="mt-2 text-xs text-ink/40 dark:text-ivory/40">
            {review.user.name} · {formatDate(review.createdAt)}
          </p>
          {review.adminReply && (
            <div className="mt-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Response from L&apos;Atelier
              </p>
              <p className="text-xs text-ink/70 dark:text-ivory/70">
                {review.adminReply}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
