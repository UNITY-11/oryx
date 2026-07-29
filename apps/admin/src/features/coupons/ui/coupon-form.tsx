"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  CheckCircle2,
  Flower2,
  Gift,
  Heart,
  Loader2,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";

import { createCoupon, updateCoupon } from "../api";
import { Coupon, CouponInput } from "../types";
import {
  hasCouponFieldErrors,
  validateCoupon,
  type CouponFieldErrors,
} from "../validation";

interface Props {
  initialData?: Coupon;
}

const AVAILABLE_ICONS = [
  { name: "Scissors", icon: Scissors },
  { name: "Sparkles", icon: Sparkles },
  { name: "Flower2", icon: Flower2 },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Gift", icon: Gift },
];

const inputClass =
  "w-full rounded-2xl border-2 border-primary/10 px-4 py-3 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm disabled:opacity-60";
const inputErrorClass =
  "border-red-400 focus:border-red-500 focus:ring-red-500/10";
const labelClass =
  "text-sm font-semibold text-text-primary uppercase tracking-wider";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export function CouponForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CouponFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const isEditMode = Boolean(initialData);
  const [initialSnapshot] = useState(() =>
    initialData
      ? formSnapshot({
          title: initialData.title || "",
          type: initialData.type || "SPECIAL OFFER",
          code: initialData.code || "",
          icon: initialData.icon || "Sparkles",
        })
      : null
  );

  const [formData, setFormData] = useState<CouponInput>({
    title: initialData?.title || "",
    type: initialData?.type || "SPECIAL OFFER",
    code: initialData?.code || "",
    icon: initialData?.icon || "Sparkles",
  });

  const isDirty = useMemo(() => {
    if (!isEditMode) return true;
    return isFormDirty(formData, initialSnapshot);
  }, [isEditMode, formData, initialSnapshot]);

  const update = <K extends keyof CouponInput>(
    key: K,
    value: CouponInput[K]
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
    const payload: CouponInput = {
      ...formData,
      type: formData.type.trim(),
      title: formData.title.trim(),
      code: formData.code.trim().toUpperCase(),
    };
    const errors = validateCoupon(payload);
    if (hasCouponFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await updateCoupon(initialData.id, payload);
        setToast({ type: "success", message: "Coupon saved successfully" });
      } else {
        await createCoupon(payload);
        setToast({ type: "success", message: "Coupon created successfully" });
      }
      setTimeout(() => {
        router.push("/coupons");
        router.refresh();
      }, 600);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save coupon",
      });
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-5 sm:space-y-6"
    >
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 space-y-5 rounded-2xl border bg-white p-4 shadow-sm sm:space-y-6 sm:rounded-3xl sm:p-6 md:p-8">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="coupon-type">
            Offer Type
          </label>
          <input
            id="coupon-type"
            type="text"
            placeholder="e.g. SPECIAL OFFER, FREE GIFT, PACKAGE"
            value={formData.type}
            onChange={(e) => update("type", e.target.value)}
            disabled={loading}
            className={`${inputClass} uppercase ${fieldErrors.type ? inputErrorClass : ""}`}
          />
          <FieldError message={fieldErrors.type} />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="coupon-title">
            Title
          </label>
          <input
            id="coupon-title"
            type="text"
            placeholder="e.g. Get 20% Off Your First Visit"
            value={formData.title}
            onChange={(e) => update("title", e.target.value)}
            disabled={loading}
            className={`${inputClass} font-serif text-base sm:text-lg ${fieldErrors.title ? inputErrorClass : ""}`}
          />
          <FieldError message={fieldErrors.title} />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="coupon-code">
            Coupon Code
          </label>
          <input
            id="coupon-code"
            type="text"
            placeholder="e.g. ORYX20"
            value={formData.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            disabled={loading}
            className={`${inputClass} text-primary font-mono text-base uppercase sm:text-lg ${fieldErrors.code ? inputErrorClass : ""}`}
          />
          <FieldError message={fieldErrors.code} />
          <p className="text-text-secondary text-xs">
            3–24 characters using letters, numbers, hyphens, or underscores.
          </p>
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Icon</label>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {AVAILABLE_ICONS.map(({ name, icon: Icon }) => {
              const isSelected = formData.icon === name;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={loading}
                  onClick={() => update("icon", name)}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all sm:h-14 sm:w-14 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100"
                  }`}
                  title={name}
                  aria-label={`Select ${name} icon`}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 rounded-full bg-white">
                      <CheckCircle2 className="fill-primary/20 text-primary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <FieldError message={fieldErrors.icon} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="border-primary/20 text-primary hover:bg-primary/5 h-12 flex-1 rounded-full border-2 text-sm font-bold transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || (isEditMode && !isDirty)}
          className="bg-primary hover:bg-primary-dark flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Create Coupon"
          )}
        </button>
      </div>
    </form>
  );
}
