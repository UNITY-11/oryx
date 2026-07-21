"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, ChevronDown, Check } from "lucide-react";
import { Review, createReview, updateReview } from "../api";

interface ReviewFormProps {
  initialData?: Review;
}

export function ReviewForm({ initialData }: ReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    text: initialData?.text ?? "",
    rating: initialData?.rating ?? 5,
    status: initialData?.status ?? "Active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData?.id) {
        await updateReview(initialData.id, formData);
      } else {
        await createReview(formData);
      }
      router.push("/reviews");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-primary-dark mb-1 block text-sm font-medium">
            Reviewer Name
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-primary/20 focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none transition-all focus:ring-4"
            placeholder="e.g. Sarah Al M."
          />
        </div>

        <div>
          <label className="text-primary-dark mb-1 block text-sm font-medium">
            Review Text
          </label>
          <textarea
            required
            rows={4}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            className="border-primary/20 focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none transition-all focus:ring-4"
            placeholder="The most relaxing massage..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <label className="text-primary-dark mb-1 block text-sm font-medium">
              Rating
            </label>
            <div className="flex h-[42px] items-center gap-1 rounded-xl border border-primary/20 bg-white px-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= formData.rating
                        ? "fill-[#e5c37a] text-[#e5c37a]"
                        : "fill-transparent text-gray-300 hover:text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-primary-dark mb-1 block text-sm font-medium">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="border-primary/20 focus:border-primary focus:ring-primary/20 flex h-[42px] w-full items-center justify-between rounded-xl border bg-white px-4 py-2 text-sm outline-none transition-all focus:ring-4"
              >
                <span
                  className={
                    formData.status === "Active"
                      ? "font-medium text-green-600"
                      : "font-medium text-gray-500"
                  }
                >
                  {formData.status}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusOpen(false)}
                  />
                  <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-primary/10 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                    {["Active", "Inactive"].map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, status: statusOption as any });
                          setIsStatusOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-primary/5"
                      >
                        <span
                          className={
                            statusOption === "Active"
                              ? "font-medium text-green-600"
                              : "font-medium text-gray-500"
                          }
                        >
                          {statusOption}
                        </span>
                        {formData.status === statusOption && (
                          <Check className="text-primary h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push("/reviews")}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-dark flex items-center justify-center rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Create Review"
          )}
        </button>
      </div>
    </form>
  );
}
