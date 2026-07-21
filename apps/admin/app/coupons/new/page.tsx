"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CouponForm } from "@/features/coupons/ui/coupon-form";

export default function NewCouponPage() {
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
              <h2 className="text-xl font-medium text-primary">Create Coupon</h2>
              <p className="text-sm text-text-secondary">Add a new promotional banner.</p>
            </div>
          </div>
        </div>
        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
