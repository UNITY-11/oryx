"use client";

import Link from "next/link";
import { ListPagination } from "@/shared/ui/list-pagination";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Package,
  Plus,
  Search,
} from "lucide-react";

import {
  CATEGORY_FILTERS,
  getStockBadgeClasses,
  SORT_OPTIONS,
} from "../api/use-products";
import { Product, ProductCategory } from "../types";

interface ProductsGridProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: ProductCategory | "All";
  setCategoryFilter: (filter: ProductCategory | "All") => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isSortOpen: boolean;
  setIsSortOpen: (open: boolean) => void;
  filtered: Product[];
  activeCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  onRetry?: () => void;
}

export function ProductsGrid({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  isSortOpen,
  setIsSortOpen,
  filtered,
  activeCount,
  lowStockCount,
  outOfStockCount,
  page,
  setPage,
  totalPages,
  totalItems,
  from,
  to,
  hasPrev,
  hasNext,
  onRetry,
}: ProductsGridProps) {
  const hasFilters =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== "All" ||
    sortBy !== "Default";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        {/* Toolbar */}
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b p-3 sm:gap-4 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 md:max-w-sm">
              <Search className="text-primary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 sm:left-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none sm:py-3 sm:pl-12"
              />
            </div>

            <div className="relative z-40 w-full shrink-0 sm:w-48">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="border-primary/20 focus:ring-primary/30 text-primary-dark hover:bg-primary/5 flex h-11 w-full cursor-pointer items-center justify-between rounded-full border bg-white px-4 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:outline-none sm:h-auto sm:py-3 sm:pr-4 sm:pl-5"
              >
                <span className="truncate">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={`text-primary h-4 w-4 shrink-0 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="border-primary/10 absolute top-full right-0 z-40 mt-2 w-full min-w-[180px] overflow-hidden rounded-2xl border bg-white shadow-xl">
                    <div className="py-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-5 py-2.5 text-left text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-primary/10 text-primary-dark font-bold"
                              : "text-text-secondary hover:bg-primary/5 hover:text-primary-dark font-medium"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="-mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
            <div className="scrollbar-hide flex w-max items-center gap-2 pb-0.5 sm:w-auto sm:flex-wrap">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors sm:px-4 sm:py-2 sm:text-xs ${
                    categoryFilter === cat
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "text-primary-dark border-primary/10 hover:bg-primary/10 bg-primary/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading products...</p>
              <p className="mt-1 text-xs">Fetching inventory from Sanity</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Couldn’t load products
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Try again
                </button>
              )}
            </div>
          ) : totalItems === 0 ? (
            <div className="border-primary/15 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-[#fcf4f0]/40 px-4 text-center sm:rounded-3xl">
              <Package className="text-primary/30 mb-3 h-10 w-10" />
              <p className="text-primary-dark text-sm font-semibold">
                {hasFilters ? "No matching products" : "No products yet"}
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {hasFilters
                  ? "Try clearing search or changing the category filter."
                  : "Add your first retail product to start tracking stock."}
              </p>
              {!hasFilters && (
                <Link
                  href="/products/new"
                  className="bg-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Product
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/products/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all sm:rounded-3xl"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:mb-3 sm:h-12 sm:w-12">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="px-2 text-center text-xs font-medium sm:px-4 sm:text-sm">
                  Add Product
                </span>
              </Link>

              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group from-primary/10 to-primary/5 relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm transition-all hover:shadow-md sm:rounded-3xl"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="text-primary/20 h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  )}

                  {/* Always visible on touch; hover-enhanced on desktop */}
                  <div className="from-primary-dark/80 via-primary-dark/25 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-2.5 opacity-100 transition-opacity duration-300 sm:p-4 md:via-transparent md:opacity-0 md:group-hover:opacity-100">
                    <p className="line-clamp-2 pr-10 text-xs leading-tight font-semibold text-white sm:text-sm">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/80 sm:text-xs">
                      QAR {product.price}
                    </p>
                  </div>

                  {product.status === "Inactive" && (
                    <>
                      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
                      <span className="absolute top-2 left-2 z-20 rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase sm:text-[10px]">
                        Inactive
                      </span>
                    </>
                  )}

                  <span
                    className={`absolute top-2 right-2 z-20 inline-flex min-w-7 items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums shadow-sm sm:top-3 sm:right-3 sm:min-w-8 sm:px-2.5 sm:py-1 sm:text-xs ${getStockBadgeClasses(product.quantity)}`}
                    title={
                      Number(product.quantity) <= 10
                        ? "Low stock"
                        : Number(product.quantity) <= 30
                          ? "Medium stock"
                          : "Good stock"
                    }
                  >
                    {Number(product.quantity) || 0}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <ListPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          from={from}
          to={to}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPageChange={setPage}
        />

        <div className="border-primary/5 text-text-secondary flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2.5 text-[11px] sm:gap-4 sm:px-6 sm:py-3 sm:text-xs">
          <span className="flex items-center gap-1">
            <Package className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-amber-600">{lowStockCount} Low Stock</span>
          <span className="text-red-500">{outOfStockCount} Out of Stock</span>
          <span className="ml-auto">{totalItems} shown</span>
        </div>
      </div>
    </div>
  );
}
