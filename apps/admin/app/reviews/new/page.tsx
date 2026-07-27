"use client";

import { useRouter } from "next/navigation";
import { ReviewForm } from "@/features/reviews/ui/review-form";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { ArrowLeft } from "lucide-react";

export default function NewReviewPage() {
  const router = useRouter();

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
                Create Review
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                Add a new client testimonial
              </p>
            </div>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
