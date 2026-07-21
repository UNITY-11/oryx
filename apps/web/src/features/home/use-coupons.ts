"use client";

import { useState, useEffect } from "react";
import { Coupon } from "@/features/catalog/sanity";

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/coupons", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load coupons");
        }
        return res.json() as Promise<Coupon[]>;
      })
      .then((data) => {
        if (!cancelled) setCoupons(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { coupons, loading };
}
