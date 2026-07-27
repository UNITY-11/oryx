"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DEFAULT_PAGE_SIZE = 20;

export function usePagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string | number
) {
  const [page, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return {
    page,
    setPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

interface ListPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function ListPagination({
  page,
  totalPages,
  totalItems,
  from,
  to,
  hasPrev,
  hasNext,
  onPageChange,
  className = "",
}: ListPaginationProps) {
  if (totalItems === 0) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <div
      className={`border-primary/10 flex shrink-0 flex-col gap-2.5 border-t bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 md:px-6 ${className}`}
    >
      <p className="text-text-secondary text-center text-xs sm:text-left">
        Showing{" "}
        <span className="text-primary-dark font-semibold">
          {from}–{to}
        </span>{" "}
        of <span className="text-primary-dark font-semibold">{totalItems}</span>
      </p>

      <div className="flex items-center justify-center gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="border-primary/15 text-primary hover:bg-primary/5 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === "…" ? (
              <span
                key={`ellipsis-${idx}`}
                className="text-text-secondary px-1 text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-xs font-semibold transition-colors ${
                  p === page
                    ? "bg-primary text-white shadow-sm"
                    : "border-primary/15 text-primary-dark hover:bg-primary/5 border"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="border-primary/15 text-primary hover:bg-primary/5 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getVisiblePages(current: number, total: number): Array<number | "…"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | "…"> = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
