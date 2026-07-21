"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponInput, Coupon } from "../types";
import { createCoupon, updateCoupon } from "../api";
import { Scissors, Sparkles, Flower2, Heart, Star, Gift, CheckCircle2 } from "lucide-react";

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

export function CouponForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CouponInput>({
    title: initialData?.title || "",
    type: initialData?.type || "SPECIAL OFFER",
    code: initialData?.code || "",
    icon: initialData?.icon || "Sparkles",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateCoupon(initialData.id, formData);
      } else {
        await createCoupon(formData);
      }
      router.push("/coupons");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save coupon.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-primary/10 space-y-6">
        
        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Offer Type
          </label>
          <input
            required
            type="text"
            placeholder="e.g. SPECIAL OFFER, FREE GIFT, PACKAGE"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-2xl border-2 border-primary/10 px-4 py-3 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm uppercase"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Title
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Get 20% Off Your First Visit"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-2xl border-2 border-primary/10 px-4 py-3 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-serif"
          />
        </div>

        {/* Code */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Coupon Code
          </label>
          <input
            required
            type="text"
            placeholder="e.g. ORYX20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full rounded-2xl border-2 border-primary/10 px-4 py-3 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-mono uppercase text-lg text-primary"
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Icon
          </label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_ICONS.map(({ name, icon: Icon }) => {
              const isSelected = formData.icon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`relative flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:border-gray-200"
                  }`}
                  title={name}
                >
                  <Icon className="w-6 h-6" />
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-full border-2 border-primary/20 px-6 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Save Changes" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
