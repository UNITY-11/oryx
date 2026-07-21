"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Star,
} from "lucide-react";

import { fetchReviews, Review } from "../../src/features/reviews/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = reviews.filter((r) => r.status === "Active").length;
  const inactiveCount = reviews.filter((r) => r.status === "Inactive").length;

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* List Header */}
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <h2 className="text-primary-dark font-serif text-lg">All Reviews</h2>
        </div>

        {/* Reviews List */}
        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <MessageSquare className="text-primary/20 mb-3 h-10 w-10" />
              <p>No reviews found. Add one to get started.</p>
            </div>
          ) : (
            <div className="border-primary/10 overflow-hidden rounded-2xl border">
              <div className="text-text-secondary border-primary/10 hidden grid-cols-[1fr_2fr_100px_100px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase md:grid">
                <span>Reviewer</span>
                <span>Review Text</span>
                <span className="text-center">Rating</span>
                <span className="text-right">Status</span>
              </div>

              <div className="divide-primary/5 divide-y">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="hover:bg-primary/5 grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors md:grid-cols-[1fr_2fr_100px_100px]"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="text-primary-dark truncate text-sm font-semibold transition-colors">
                        {review.name}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <span className="text-text-secondary line-clamp-2 text-sm italic">
                        "{review.text}"
                      </span>
                    </div>

                    <div className="hidden md:flex justify-center items-center gap-1">
                      <span className="text-primary-dark font-medium text-sm">{review.rating}</span>
                      <Star className="text-yellow-500 h-4 w-4 fill-yellow-500" />
                    </div>

                    <div className="hidden text-right md:block">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          review.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-primary/5 text-text-secondary flex shrink-0 items-center gap-4 border-t px-6 py-3 text-xs">
          <span className="flex items-center gap-1">
            <MessageSquare className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-gray-500">{inactiveCount} Inactive</span>
          <span className="ml-auto">{reviews.length} total</span>
        </div>
      </div>
    </div>
  );
}
