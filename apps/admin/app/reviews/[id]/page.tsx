"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchReviewById, Review } from "@/features/reviews/api";
import { ReviewForm } from "@/features/reviews/ui/review-form";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function EditReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadReview = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchReviewById(id)
      .then(setData)
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load review"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <button
              type="button"
              onClick={() => router.push("/reviews")}
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                {data?.name ?? "Edit Review"}
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                Modify client testimonial
              </p>
            </div>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading review...</p>
            </div>
          ) : loadError || !data ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-primary-dark mb-1 text-lg font-semibold">
                Review unavailable
              </p>
              <p className="text-text-secondary mb-5 max-w-sm text-sm">
                {loadError ?? "This review could not be found."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={loadReview}
                  className="border-primary text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-semibold"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/reviews")}
                  className="bg-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Back to Reviews
                </button>
              </div>
            </div>
          ) : (
            <ReviewForm initialData={data} />
          )}
        </div>
      </div>
    </div>
  );
}
