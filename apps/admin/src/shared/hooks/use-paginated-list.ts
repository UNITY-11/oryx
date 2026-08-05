import { useCallback, useEffect, useState } from "react";
import type { PaginatedResponse } from "@/shared/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/shared/ui/list-pagination";

export type FetchPageParams = {
  q: string;
  page: number;
  pageSize: number;
  order?: "asc" | "desc";
  [key: string]: string | number | undefined;
};

export type FetchPageFn<
  T,
  M extends Record<string, number> = Record<string, number>,
> = (params: FetchPageParams) => Promise<PaginatedResponse<T, M>>;

export function usePaginatedList<
  T,
  M extends Record<string, number> = Record<string, number>,
>(
  fetchPage: FetchPageFn<T, M>,
  options?: {
    extraParams?: Record<string, string | number | undefined>;
    extraDeps?: unknown[];
    debounceMs?: number;
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [meta, setMeta] = useState<M | undefined>(undefined);

  const debounceMs = options?.debounceMs ?? 300;
  const extraParams = options?.extraParams;
  const extraDeps = options?.extraDeps ?? [];
  const extraParamsKey = JSON.stringify(extraParams ?? {});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, extraParamsKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPage({
      q: debouncedSearch,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      ...extraParams,
    })
      .then((result) => {
        setItems(result.items);
        setTotalItems(result.total);
        setTotalPages(result.totalPages);
        setMeta(result.meta);
        if (page > result.totalPages) {
          setPage(Math.max(1, result.totalPages));
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [fetchPage, debouncedSearch, page, extraParamsKey, ...extraDeps]);

  useEffect(() => {
    reload();
  }, [reload]);

  const pageSize = DEFAULT_PAGE_SIZE;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return {
    items,
    setItems,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    meta,
    reload,
  };
}
