"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { Check, ChevronDown, Loader2, Star } from "lucide-react";

import { createReview, Review, updateReview } from "../api";
import {
  hasReviewFieldErrors,
  validateReview,
  type ReviewFieldErrors,
  type ReviewFormData,
} from "../validation";

interface ReviewFormProps {
  initialData?: Review;
}

const inputClass =
  "border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-60";
const inputErrorClass = "border-red-400 focus:border-red-500";
const labelClass =
  "text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function StatusDropdown({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: ReviewFormData["status"];
  onChange: (v: ReviewFormData["status"]) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${inputClass} flex items-center justify-between ${hasError ? inputErrorClass : ""}`}
      >
        <span
          className={
            value === "Active"
              ? "font-medium text-green-600"
              : "font-medium text-gray-500"
          }
        >
          {value}
        </span>
        <ChevronDown
          className={`text-primary/60 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {(["Active", "Inactive"] as const).map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(statusOption);
                setOpen(false);
              }}
              className={`hover:bg-primary/5 flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${statusOption === value ? "text-primary font-medium" : "text-primary-dark"}`}
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
              {statusOption === value && (
                <Check className="text-primary h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewForm({ initialData }: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReviewFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const isEditMode = Boolean(initialData?.id);
  const [initialSnapshot] = useState(() =>
    initialData
      ? formSnapshot({
          name: initialData.name ?? "",
          text: initialData.text ?? "",
          rating: initialData.rating ?? 5,
          status: initialData.status ?? "Active",
        })
      : null
  );

  const [formData, setFormData] = useState<ReviewFormData>({
    name: initialData?.name ?? "",
    text: initialData?.text ?? "",
    rating: initialData?.rating ?? 5,
    status: initialData?.status ?? "Active",
  });

  const isDirty = useMemo(() => {
    if (!isEditMode) return true;
    return isFormDirty(formData, initialSnapshot);
  }, [isEditMode, formData, initialSnapshot]);

  const update = <K extends keyof ReviewFormData>(
    key: K,
    value: ReviewFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && !isDirty) return;

    const payload: ReviewFormData = {
      ...formData,
      name: formData.name.trim(),
      text: formData.text.trim(),
    };

    const errors = validateReview(payload);
    if (hasReviewFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      if (initialData?.id) {
        await updateReview(initialData.id, payload);
        setToast({ type: "success", message: "Review saved successfully" });
      } else {
        await createReview(payload);
        setToast({ type: "success", message: "Review created successfully" });
      }
      setTimeout(() => router.push("/reviews"), 900);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
      setSaving(false);
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={closeToast} />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-5 sm:space-y-6"
      >
        <div>
          <label className={labelClass}>Reviewer Name *</label>
          <input
            type="text"
            value={formData.name}
            disabled={saving}
            onChange={(e) => update("name", e.target.value)}
            className={`${inputClass} text-base font-medium ${fieldErrors.name ? inputErrorClass : ""}`}
            placeholder="e.g. Sarah Al M."
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label className={labelClass}>Review Text *</label>
          <textarea
            rows={4}
            value={formData.text}
            disabled={saving}
            onChange={(e) => update("text", e.target.value)}
            className={`${inputClass} min-h-[120px] resize-y ${fieldErrors.text ? inputErrorClass : ""}`}
            placeholder="The most relaxing massage..."
          />
          <FieldError message={fieldErrors.text} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Rating *</label>
            <div
              className={`flex h-[46px] items-center gap-1 rounded-2xl border bg-transparent px-2 ${fieldErrors.rating ? inputErrorClass : "border-primary/40"}`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={saving}
                  onClick={() => update("rating", star)}
                  className="rounded-lg p-1.5 transition-transform hover:scale-110 focus:outline-none active:scale-95 disabled:opacity-60"
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
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
            <FieldError message={fieldErrors.rating} />
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <StatusDropdown
              value={formData.status}
              disabled={saving}
              hasError={Boolean(fieldErrors.status)}
              onChange={(v) => update("status", v)}
            />
            <FieldError message={fieldErrors.status} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/reviews")}
            disabled={saving}
            className="border-primary/20 text-primary hover:bg-primary/5 h-11 rounded-full border px-6 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || (isEditMode && !isDirty)}
            className="bg-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {initialData ? "Saving…" : "Creating…"}
              </>
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Create Review"
            )}
          </button>
        </div>
      </form>
    </>
  );
}
