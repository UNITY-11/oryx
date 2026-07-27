"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { deleteReview, Review, updateReview } from "../api";

interface ReviewsListProps {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  activeCount: number;
  inactiveCount: number;
  onRetry?: () => void;
  onReload?: () => void;
  onOptimisticUpdate?: (updater: (reviews: Review[]) => Review[]) => void;
}

function statusBadgeClass(status: Review["status"]) {
  return status === "Active"
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-gray-200 bg-gray-100 text-gray-500";
}

export function ReviewsList({
  loading,
  error,
  reviews,
  activeCount,
  inactiveCount,
  onRetry,
  onReload,
  onOptimisticUpdate,
}: ReviewsListProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = usePagination(reviews, 20);

  const applyLocalUpdate = useCallback(
    (updater: (items: Review[]) => Review[]) => {
      if (onOptimisticUpdate) {
        onOptimisticUpdate(updater);
      } else {
        onReload?.();
      }
    },
    [onOptimisticUpdate, onReload]
  );

  const handleToggleStatus = async (review: Review) => {
    const nextStatus = review.status === "Active" ? "Inactive" : "Active";
    try {
      setIsProcessing(review.id);
      await updateReview(review.id, { ...review, status: nextStatus });
      applyLocalUpdate((items) =>
        items.map((r) =>
          r.id === review.id ? { ...r, status: nextStatus } : r
        )
      );
      setToast({
        type: "success",
        message: `Review ${nextStatus === "Active" ? "shown" : "hidden"} on site`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update review status",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsProcessing(deleteTarget.id);
      await deleteReview(deleteTarget.id);
      applyLocalUpdate((items) =>
        items.filter((r) => r.id !== deleteTarget.id)
      );
      setToast({ type: "success", message: "Review deleted successfully" });
      setDeleteTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete review",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Couldn&apos;t load reviews
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  Try again
                </button>
              )}
            </div>
          ) : totalItems === 0 ? (
            <div className="border-primary/15 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-[#fcf4f0]/40 px-4 text-center sm:rounded-3xl">
              <MessageSquare className="text-primary/30 mb-3 h-10 w-10" />
              <p className="text-primary-dark text-sm font-semibold">
                No reviews yet
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                Add your first client testimonial to showcase on the site.
              </p>
              <Link
                href="/reviews/new"
                className="bg-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Review
              </Link>
            </div>
          ) : (
            <div className="border-primary/10 overflow-hidden rounded-2xl border">
              <div className="text-text-secondary border-primary/10 sticky top-0 z-10 hidden grid-cols-[minmax(0,1fr)_minmax(0,2fr)_80px_90px_100px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase lg:grid">
                <span>Reviewer</span>
                <span>Review Text</span>
                <span className="text-center">Rating</span>
                <span className="text-center">Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-primary/5 divide-y">
                {paginatedItems.map((review) => (
                  <div
                    key={review.id}
                    className="hover:bg-primary/5 grid grid-cols-1 gap-3 px-3.5 py-4 transition-colors sm:gap-4 sm:px-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_80px_90px_100px] lg:items-center"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2 lg:contents">
                      <div className="flex min-w-0 flex-col lg:col-start-1">
                        <span className="text-primary-dark truncate text-sm font-semibold">
                          {review.name}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 lg:hidden">
                          <span className="text-primary-dark text-xs font-medium">
                            {review.rating}
                          </span>
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <span
                            className={`ml-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${statusBadgeClass(review.status)}`}
                          >
                            {review.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(review)}
                          disabled={isProcessing === review.id}
                          className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                          title={
                            review.status === "Active"
                              ? "Hide review"
                              : "Show review"
                          }
                          aria-label={
                            review.status === "Active"
                              ? "Hide review"
                              : "Show review"
                          }
                        >
                          {isProcessing === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : review.status === "Active" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          href={`/reviews/${review.id}`}
                          className="text-primary hover:text-primary-dark transition-colors"
                          title="Edit"
                          aria-label="Edit review"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(review)}
                          disabled={isProcessing === review.id}
                          className="text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                          aria-label="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 lg:col-start-2">
                      <p className="text-text-secondary line-clamp-2 text-sm italic">
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>

                    <div className="hidden items-center justify-center gap-1 lg:flex">
                      <span className="text-primary-dark text-sm font-medium">
                        {review.rating}
                      </span>
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    </div>

                    <div className="hidden text-center lg:block">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${statusBadgeClass(review.status)}`}
                      >
                        {review.status}
                      </span>
                    </div>

                    <div className="hidden items-center justify-end gap-2 lg:flex">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(review)}
                        disabled={isProcessing === review.id}
                        className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                        title={
                          review.status === "Active"
                            ? "Hide review"
                            : "Show review"
                        }
                        aria-label={
                          review.status === "Active"
                            ? "Hide review"
                            : "Show review"
                        }
                      >
                        {isProcessing === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : review.status === "Active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/reviews/${review.id}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                        title="Edit"
                        aria-label="Edit review"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(review)}
                        disabled={isProcessing === review.id}
                        className="text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
                        title="Delete"
                        aria-label="Delete review"
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

        {!loading && !error && totalItems > 0 && (
          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPageChange={setPage}
          />
        )}

        <div className="border-primary/5 text-text-secondary flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2.5 text-[11px] sm:gap-4 sm:px-6 sm:py-3 sm:text-xs">
          <span className="flex items-center gap-1">
            <MessageSquare className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-gray-500">{inactiveCount} Inactive</span>
          <span className="ml-auto">{totalItems} total</span>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-primary/10 w-full max-w-md rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-primary-dark font-serif text-lg font-semibold">
                Delete Review
              </h3>
            </div>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-primary-dark font-semibold">
                {deleteTarget.name}
              </span>
              &apos;s review? This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
                disabled={isProcessing === deleteTarget.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing === deleteTarget.id}
                className="bg-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing === deleteTarget.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
