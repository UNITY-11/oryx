"use client";

import { useState, useEffect } from "react";
import { Review } from "@/features/catalog/sanity";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load reviews");
        }
        return res.json() as Promise<Review[]>;
      })
      .then((data) => {
        if (!cancelled) setReviews(data);
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

  return { reviews, loading };
}
