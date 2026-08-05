import { useCallback, useState } from "react";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";

import { fetchCustomersPage } from "../api";
import { CustomerTier } from "../types";

export const TIER_FILTERS: Array<CustomerTier | "All"> = [
  "All",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
];

export function useCustomers() {
  const [tierFilter, setTierFilter] = useState<CustomerTier | "All">("All");

  const fetchPage = useCallback(
    (params: { q: string; page: number; pageSize: number }) =>
      fetchCustomersPage({
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        tier: tierFilter,
      }),
    [tierFilter]
  );

  const list = usePaginatedList(fetchPage, {
    extraParams: { tier: tierFilter },
    extraDeps: [tierFilter],
  });

  return {
    loading: list.loading,
    error: list.error,
    searchQuery: list.searchQuery,
    setSearchQuery: list.setSearchQuery,
    tierFilter,
    setTierFilter,
    filtered: list.items,
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
