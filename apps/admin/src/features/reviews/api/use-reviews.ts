import { useState, useEffect } from "react";
import { fetchReviews, Review } from "../api";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = reviews.filter((r) => r.status === "Active").length;
  const inactiveCount = reviews.filter((r) => r.status === "Inactive").length;

  return {
    reviews,
    loading,
    error,
    activeCount,
    inactiveCount,
  };
}
