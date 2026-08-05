"use client";

import { useReviews } from "@features/reviews/api/use-reviews";
import { ReviewsList } from "@features/reviews/ui/reviews-list";

export default function ReviewsPage() {
  const {
    reviews,
    setReviews,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeCount,
    inactiveCount,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
    reload,
  } = useReviews();

  return (
    <ReviewsList
      loading={loading}
      error={error}
      reviews={reviews}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      activeCount={activeCount}
      inactiveCount={inactiveCount}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      totalItems={totalItems}
      from={from}
      to={to}
      hasPrev={hasPrev}
      hasNext={hasNext}
      onRetry={reload}
      onReload={reload}
      onOptimisticUpdate={(updater) => setReviews(updater)}
    />
  );
}
