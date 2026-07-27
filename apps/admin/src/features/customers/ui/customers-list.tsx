"use client";

import Link from "next/link";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import {
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserCircle2,
} from "lucide-react";

import { TIER_FILTERS } from "../api/use-customers";
import { Customer, CustomerTier } from "../types";

interface CustomersListProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tierFilter: CustomerTier | "All";
  setTierFilter: (filter: CustomerTier | "All") => void;
  filtered: Customer[];
  activeCount: number;
  inactiveCount: number;
  onRetry?: () => void;
}

function tierBadgeClass(tier: CustomerTier) {
  if (tier === "Platinum")
    return "border-slate-200 bg-slate-100 text-slate-700";
  if (tier === "Gold") return "border-amber-200 bg-amber-50 text-amber-600";
  if (tier === "Silver") return "border-gray-200 bg-gray-50 text-gray-500";
  return "border-orange-200 bg-orange-50 text-orange-700";
}

export function CustomersList({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  tierFilter,
  setTierFilter,
  filtered,
  activeCount,
  inactiveCount,
  onRetry,
}: CustomersListProps) {
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = usePagination(filtered, 20, `${searchQuery}|${tierFilter}`);

  const hasFilters = Boolean(searchQuery.trim()) || tierFilter !== "All";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b p-3 sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="relative w-full md:max-w-sm md:shrink-0">
            <Search className="text-primary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none sm:py-3 sm:pl-12"
            />
          </div>

          <div className="-mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
            <div className="scrollbar-hide flex w-max items-center gap-2 pb-0.5 sm:w-auto sm:flex-wrap sm:justify-end">
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors sm:px-4 sm:py-2 sm:text-xs ${
                    tierFilter === tier
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "text-text-secondary border-primary/10 hover:bg-primary/5 bg-white"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Couldn’t load customers
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  Try again
                </button>
              )}
            </div>
          ) : totalItems === 0 ? (
            <div className="border-primary/15 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-[#fcf4f0]/40 px-4 text-center sm:rounded-3xl">
              <UserCircle2 className="text-primary/30 mb-3 h-10 w-10" />
              <p className="text-primary-dark text-sm font-semibold">
                {hasFilters ? "No matching customers" : "No customers yet"}
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {hasFilters
                  ? "Try clearing search or changing the tier filter."
                  : "Add your first customer to start tracking visits."}
              </p>
              {!hasFilters && (
                <Link
                  href="/customers/new"
                  className="bg-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Customer
                </Link>
              )}
            </div>
          ) : (
            <div className="border-primary/10 overflow-hidden rounded-2xl border">
              <div className="text-text-secondary border-primary/10 sticky top-0 z-10 hidden grid-cols-[auto_1fr_1fr_100px_100px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase lg:grid">
                <span className="w-10" />
                <span>Customer</span>
                <span>Contact</span>
                <span>Tier</span>
                <span className="text-right">Total Spent</span>
              </div>

              <div className="divide-primary/5 divide-y">
                {paginatedItems.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="hover:bg-primary/5 group grid grid-cols-1 gap-3 px-3.5 py-4 transition-colors sm:gap-4 sm:px-5 md:px-6 lg:grid-cols-[auto_1fr_1fr_100px_100px] lg:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border font-serif">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col lg:contents">
                        <div className="flex min-w-0 flex-col lg:col-start-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-primary-dark group-hover:text-primary truncate text-sm font-semibold transition-colors">
                              {customer.name}
                            </span>
                            <span className="text-primary-dark shrink-0 text-sm font-semibold lg:hidden">
                              QAR {customer.totalSpent}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-text-secondary text-xs">
                              Last visit: {customer.lastVisit || "—"}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase lg:hidden ${tierBadgeClass(customer.tier)}`}
                            >
                              {customer.tier}
                            </span>
                          </div>
                          <div className="text-text-secondary mt-1.5 flex flex-col gap-0.5 text-xs lg:hidden">
                            {customer.email && (
                              <span className="flex items-center gap-1.5 truncate">
                                <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                                {customer.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5 truncate">
                              <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 flex-col space-y-1 lg:flex">
                      <span className="text-text-secondary flex items-center gap-1.5 truncate text-xs">
                        <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                        {customer.email || "—"}
                      </span>
                      <span className="text-text-secondary flex items-center gap-1.5 truncate text-xs">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                        {customer.phone}
                      </span>
                    </div>

                    <div className="hidden lg:block">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${tierBadgeClass(customer.tier)}`}
                      >
                        {customer.tier}
                      </span>
                    </div>

                    <div className="hidden text-right lg:block">
                      <span className="text-primary-dark text-sm font-semibold">
                        QAR {customer.totalSpent}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
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
            <UserCircle2 className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-red-500">{inactiveCount} Inactive</span>
          <span className="ml-auto">{totalItems} shown</span>
        </div>
      </div>
    </div>
  );
}
