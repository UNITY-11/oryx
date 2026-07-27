import Link from "next/link";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import { AlertCircle, ImageIcon, Loader2, Search, Star } from "lucide-react";

import { CATEGORY_FILTERS } from "../api/use-services";
import { Service, ServiceCategory } from "../types";

interface ServicesGridProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: ServiceCategory | "All";
  setCategoryFilter: (filter: ServiceCategory | "All") => void;
  filtered: Service[];
  activeCount: number;
  inactiveCount: number;
}

export function ServicesGrid({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  filtered,
  activeCount,
  inactiveCount,
}: ServicesGridProps) {
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
  } = usePagination(filtered, 20, `${searchQuery}|${categoryFilter}`);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        {/* Toolbar */}
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b p-3 sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="relative w-full md:max-w-sm md:shrink-0">
            <Search className="text-primary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none sm:py-3 sm:pl-12"
            />
          </div>

          <div className="-mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 sm:-mx-0 sm:w-auto sm:overflow-visible sm:px-0 md:max-w-[60%]">
            <div className="scrollbar-hide flex w-max items-center gap-2 pb-0.5 sm:w-auto sm:flex-wrap sm:justify-end">
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
        <div className="scrollbar-hide flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm">Loading services...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center px-4 text-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center px-4 text-center">
              <ImageIcon className="text-primary/20 mb-3 h-10 w-10" />
              <p className="text-sm">
                No services found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/services/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all sm:rounded-3xl"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:mb-3 sm:h-12 sm:w-12">
                  <span className="text-xl leading-none font-light sm:text-2xl">
                    +
                  </span>
                </div>
                <span className="px-2 text-center text-xs font-medium sm:px-4 sm:text-sm">
                  Add Service
                </span>
              </Link>

              {paginatedItems.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group from-primary/10 to-primary/5 relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm transition-all hover:shadow-md sm:rounded-3xl"
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="text-primary/20 h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  )}

                  {/* Always visible on touch; hover-enhanced on desktop */}
                  <div className="from-primary-dark/80 via-primary-dark/20 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-2.5 opacity-100 transition-opacity duration-300 sm:p-4 md:via-transparent md:opacity-0 md:group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs leading-tight font-semibold text-white sm:text-sm">
                      {service.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/80 sm:text-xs">
                      {service.category}
                    </p>
                  </div>

                  {service.status === "Inactive" && (
                    <>
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
                      <span className="absolute top-2 right-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase sm:text-[10px]">
                        Inactive
                      </span>
                    </>
                  )}
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

        {/* Footer stats */}
        <div className="border-primary/5 text-text-secondary flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2.5 text-[11px] sm:gap-4 sm:px-6 sm:py-3 sm:text-xs">
          <span className="flex items-center gap-1">
            <Star className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span>{inactiveCount} Inactive</span>
          <span className="ml-auto">{totalItems} shown</span>
        </div>
      </div>
    </div>
  );
}
