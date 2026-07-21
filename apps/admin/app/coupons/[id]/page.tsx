"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CouponForm } from "@/features/coupons/ui/coupon-form";
import { fetchCouponById } from "@/features/coupons/api";
import { Coupon } from "@/features/coupons/types";

export default function EditCouponPage() {
  const params = useParams();
  const [data, setData] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCouponById(params.id as string)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between border-b p-4 md:flex-row md:p-6">
          <div className="flex items-center gap-4">
            <Link
              href="/coupons"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:bg-primary/5"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-xl font-medium text-primary">Edit Coupon</h2>
              <p className="text-sm text-text-secondary">Modify promotional banner.</p>
            </div>
          </div>
        </div>
        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="h-96 max-w-2xl bg-primary/5 rounded-3xl animate-pulse" />
          ) : data ? (
            <CouponForm initialData={data} />
          ) : (
            <p className="text-red-500 font-medium">Coupon not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
