import { parseOrThrow } from "@/shared/lib/api-helpers";
import {
  buildFetchPageQuery,
  type PaginatedResponse,
} from "@/shared/lib/pagination";

import { Coupon, CouponInput } from "./types";

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch("/api/coupons");
  if (!res.ok) {
    throw new Error("Failed to fetch coupons");
  }
  return res.json();
}

export async function fetchCouponsPage(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Coupon>> {
  const qs = buildFetchPageQuery(params);
  const res = await fetch(`/api/coupons?${qs}`, { cache: "no-store" });
  return parseOrThrow(res, "Failed to load coupons");
}

export async function fetchCouponById(id: string): Promise<Coupon> {
  const res = await fetch(`/api/coupons/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch coupon");
  }
  return res.json();
}

export async function createCoupon(data: CouponInput): Promise<Coupon> {
  const res = await fetch("/api/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create coupon");
  }
  return res.json();
}

export async function updateCoupon(
  id: string,
  data: Partial<CouponInput>
): Promise<Coupon> {
  const res = await fetch(`/api/coupons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update coupon");
  }
  return res.json();
}

export async function deleteCoupon(id: string): Promise<void> {
  const res = await fetch(`/api/coupons/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete coupon");
  }
}
