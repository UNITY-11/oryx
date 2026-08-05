import { useCallback } from "react";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";

import { fetchReviewsPage } from "../api";

export function useReviews() {
  const fetchPage = useCallback(
    (params: { q: string; page: number; pageSize: number }) =>
      fetchReviewsPage({
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
      }),
    []
  );

  const list = usePaginatedList(fetchPage);

  return {
    reviews: list.items,
    setReviews: list.setItems,
    loading: list.loading,
    error: list.error,
    searchQuery: list.searchQuery,
    setSearchQuery: list.setSearchQuery,
    activeCount: list.meta?.activeCount ?? 0,
    inactiveCount: list.meta?.inactiveCount ?? 0,
    page: list.page,
    setPage: list.setPage,
    totalPages: list.totalPages,
    totalItems: list.totalItems,
    from: list.from,
    to: list.to,
    hasPrev: list.hasPrev,
    hasNext: list.hasNext,
    reload: list.reload,
  };
}
