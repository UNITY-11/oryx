"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, MessageSquare, Star, Trash2, EyeOff, Eye, Edit } from "lucide-react";
import { Review, updateReview, deleteReview } from "../api";

interface ReviewsListProps {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  activeCount: number;
  inactiveCount: number;
}

export function ReviewsList({
  loading,
  error,
  reviews,
  activeCount,
  inactiveCount,
}: ReviewsListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggleStatus = async (review: Review) => {
    try {
      setIsProcessing(review.id);
      await updateReview(review.id, {
        ...review,
        status: review.status === "Active" ? "Inactive" : "Active"
      });
      router.refresh();
      // Reloading the page might be needed since we rely on `useReviews` hook which fetches on mount,
      // but if we want instant update, we should pass an update function from `useReviews`.
      // For now, window.location.reload() will work, or we can just let `router.refresh()` do its thing 
      // if it's hitting server actions, but `useReviews` is a client hook fetching from API.
      // So let's force a reload.
      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      setIsProcessing(id);
      await deleteReview(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
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
            <div className="border-primary/10 overflow-hidden rounded-2xl border relative">
              <div className="text-text-secondary border-primary/10 hidden grid-cols-[1fr_2fr_100px_100px_120px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase md:grid sticky top-0 z-10 shadow-sm">
                <span>Reviewer</span>
                <span>Review Text</span>
                <span className="text-center">Rating</span>
                <span className="text-right">Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-primary/5 divide-y">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="hover:bg-primary/5 grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors md:grid-cols-[1fr_2fr_100px_100px_120px]"
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
                    
                    <div className="hidden md:flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(review)}
                        disabled={isProcessing === review.id}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={review.status === "Active" ? "Hide" : "Show"}
                      >
                        {review.status === "Active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/reviews/${review.id}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isProcessing === review.id}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
