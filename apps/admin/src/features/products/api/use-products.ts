import { useCallback, useState } from "react";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";

import { fetchProductsPage } from "../api";
import { ProductCategory } from "../types";

export const CATEGORY_FILTERS: Array<ProductCategory | "All"> = [
  "All",
  "Skincare",
  "Body Care",
  "Hair Care",
  "Aromatherapy",
  "Accessories",
  "Supplements",
];

export const SORT_OPTIONS = [
  { value: "Default", label: "Sort: Default" },
  { value: "StockHigh", label: "Quantity: High → Low" },
  { value: "StockLow", label: "Quantity: Low → High" },
];

/** Stock level bands for quantity badges */
export function getStockLevel(quantity: number): "low" | "medium" | "good" {
  const qty = Number(quantity) || 0;
  if (qty <= 10) return "low";
  if (qty <= 30) return "medium";
  return "good";
}

export function getStockBadgeClasses(quantity: number): string {
  const level = getStockLevel(quantity);
  if (level === "low") {
    return "border-red-200 bg-red-500 text-white";
  }
  if (level === "medium") {
    return "border-amber-200 bg-amber-400 text-amber-950";
  }
  return "border-green-200 bg-green-500 text-white";
}

export function useProducts() {
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">(
    "All"
  );
  const [sortBy, setSortBy] = useState("Default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const fetchPage = useCallback(
    (params: { q: string; page: number; pageSize: number }) =>
      fetchProductsPage({
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        category: categoryFilter,
        sort: sortBy,
      }),
    [categoryFilter, sortBy]
  );

  const list = usePaginatedList(fetchPage, {
    extraParams: { category: categoryFilter, sort: sortBy },
    extraDeps: [categoryFilter, sortBy],
  });

  return {
    loading: list.loading,
    error: list.error,
    searchQuery: list.searchQuery,
    setSearchQuery: list.setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    isSortOpen,
    setIsSortOpen,
    filtered: list.items,
    activeCount: list.meta?.activeCount ?? 0,
    lowStockCount: list.meta?.lowStockCount ?? 0,
    outOfStockCount: list.meta?.outOfStockCount ?? 0,
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
