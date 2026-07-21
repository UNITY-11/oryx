"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Star,
} from "lucide-react";

import { createReview, Review } from "../../../src/features/reviews/api";

interface NewReviewState {
  name: string;
  text: string;
  rating: number;
  status: "Active" | "Inactive";
}

const DEFAULT_STATE: NewReviewState = {
  name: "",
  text: "",
  rating: 5,
  status: "Active",
};

export default function NewReviewPage() {
  const router = useRouter();
  const [review, setReview] = useState<NewReviewState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = <K extends keyof NewReviewState>(
    key: K,
    value: NewReviewState[K]
  ) => setReview((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    if (!review.name.trim() || !review.text.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createReview({
        ...review,
        avatar: null,
      });
      setSaved(true);
      setTimeout(() => router.push("/reviews"), 1200);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to create review"
      );
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-6 py-5 md:px-8">
          <button
            onClick={() => router.push("/reviews")}
            className="text-text-secondary hover:text-primary-dark group flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Reviews
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                update(
                  "status",
                  review.status === "Active" ? "Inactive" : "Active"
                )
              }
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                review.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {review.status}
            </button>

            <button
              onClick={handleCreate}
              disabled={!review.name.trim() || !review.text.trim() || saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Creating..." : saved ? "Created!" : "Create Review"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-auto p-6 md:p-8">
          {saveError && (
            <div className="mx-auto mb-6 flex max-w-3xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
          
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <div className="min-w-0 flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    value={review.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Sarah Al M."
                    className="border-primary/40 focus:border-primary focus:ring-primary/20 text-primary-dark placeholder:text-text-secondary/50 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm transition-colors focus:ring-4 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Rating *
                  </label>
                  <div className="flex items-center gap-1 h-12">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => update("rating", star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Review Text *
                </label>
                <textarea
                  value={review.text}
                  onChange={(e) => update("text", e.target.value)}
                  placeholder="Type the review content here..."
                  rows={4}
                  className="border-primary/40 focus:border-primary focus:ring-primary/20 text-primary-dark placeholder:text-text-secondary/50 w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-sm transition-colors focus:ring-4 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
