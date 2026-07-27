"use client";

import Link from "next/link";
import { CouponForm } from "@/features/coupons/ui/coupon-form";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { ChevronLeft } from "lucide-react";

export default function NewCouponPage() {
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
              Create Coupon
            </h2>
            <p className="text-text-secondary text-sm">
              Add a new promotional banner.
            </p>
          </div>
        </div>
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
