"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchCouponById } from "@/features/coupons/api";
import { Coupon } from "@/features/coupons/types";
import { CouponForm } from "@/features/coupons/ui/coupon-form";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";

export default function EditCouponPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coupon = await fetchCouponById(id);
      setData(coupon);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load coupon");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 items-start gap-3 border-b p-4 sm:items-center sm:p-5 md:p-6">
          <MobileMenuButton className="-ml-0" />
          <Link
            href="/coupons"
            className="border-primary/20 text-primary hover:bg-primary/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
            aria-label="Back to coupons"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-primary-dark truncate font-serif text-xl font-medium sm:text-2xl">
              Edit Coupon
            </h2>
            <p className="text-text-secondary text-sm">
              Modify promotional banner.
            </p>
          </div>
        </div>
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading coupon...</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Couldn&apos;t load coupon
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {error}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={load}
                  className="bg-primary rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  Try again
                </button>
                <Link
                  href="/coupons"
                  className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-5 py-2 text-xs font-semibold"
                >
                  Back to Coupons
                </Link>
              </div>
            </div>
          ) : data ? (
            <CouponForm initialData={data} />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Coupon not found
              </p>
              <Link
                href="/coupons"
                className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Back to Coupons
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
