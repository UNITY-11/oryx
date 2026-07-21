import Link from "next/link";
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
  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <div className="relative w-full shrink-0 md:w-80">
            <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="scrollbar-hide flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
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

        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <ImageIcon className="text-primary/20 mb-3 h-10 w-10" />
              <p>No services found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/services/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all"
                style={{ aspectRatio: "3/4" }}
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                  <span className="text-2xl leading-none font-light">+</span>
                </div>
                <span className="px-4 text-center text-sm font-medium">
                  Add Service
                </span>
              </Link>

              {filtered.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group from-primary/10 to-primary/5 relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-sm transition-all hover:shadow-md"
                  style={{ aspectRatio: "3/4" }}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="text-primary/20 h-10 w-10" />
                    </div>
                  )}

                  <div className="from-primary-dark/70 absolute inset-0 flex items-end bg-gradient-to-t via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm leading-tight font-semibold text-white">
                      {service.name}
                    </p>
                  </div>

                  {service.status === "Inactive" && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-primary/5 text-text-secondary flex shrink-0 items-center gap-4 border-t px-6 py-3 text-xs">
          <span className="flex items-center gap-1">
            <Star className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span>{inactiveCount} Inactive</span>
          <span className="ml-auto">{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
}
