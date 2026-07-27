import { useCallback, useEffect, useState } from "react";

import { fetchReviews, Review } from "../api";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReviews()
      .then(setReviews)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load reviews")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const activeCount = reviews.filter((r) => r.status === "Active").length;
  const inactiveCount = reviews.filter((r) => r.status === "Inactive").length;

  return {
    reviews,
    setReviews,
    loading,
    error,
    activeCount,
    inactiveCount,
    reload,
  };
}
