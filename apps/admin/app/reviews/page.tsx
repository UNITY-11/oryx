"use client";

import { useReviews } from "@features/reviews/api/use-reviews";
import { ReviewsList } from "@features/reviews/ui/reviews-list";

export default function ReviewsPage() {
  const {
    reviews,
    loading,
    error,
    activeCount,
    inactiveCount,
  } = useReviews();

  return (
    <ReviewsList
      loading={loading}
      error={error}
      reviews={reviews}
      activeCount={activeCount}
      inactiveCount={inactiveCount}
    />
  );
}
