"use client";

import Link from "next/link";
import { useSearch } from "@/shared/providers/search-provider";
import { Item } from "@/shared/types";
import { LotusSeparator } from "@/shared/ui/lotus-separator";
import { Loader2, Search, X } from "lucide-react";

export function ServicesPageClient({
  initialServices,
}: {
  initialServices: Item[];
}) {
  const services = initialServices;
  const loading = false;
  const error = null;
  const { query, setQuery } = useSearch();

  const isSearching = Boolean(query.trim());

  const filteredServices = services.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className={`mx-auto flex h-full w-full max-w-screen-2xl flex-col lg:max-w-7xl xl:max-w-[90rem] ${
        isSearching
          ? "pt-0 md:pt-8 lg:pt-28 xl:pt-32"
          : "pt-6 md:pt-24 lg:pt-28"
      }`}
    >
      {/* Mobile search — TopNav is hidden below md */}
      <div className="mb-4 px-6 md:hidden">
        {!isSearching && (
          <h1 className="text-surface mb-4 text-center font-serif text-2xl font-semibold">
            Our Services
          </h1>
        )}
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#c8a24a]" />
          <input
            type="text"
            placeholder="Search treatments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-[#c8a24a] bg-gray-50 py-3.5 pr-11 pl-12 text-sm transition-shadow outline-none placeholder:text-[#c8a24a]/70 focus:ring-2 focus:ring-[#c8a24a]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#c8a24a] transition-colors hover:bg-[#c8a24a]/10"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isSearching && (
        <header className="mb-6 hidden px-6 text-center lg:mb-12 lg:block lg:px-16">
          <p className="text-surface/80 mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
            Treatments &amp; Rituals
          </p>
          <h1 className="text-surface font-serif text-4xl font-semibold xl:text-5xl">
            Our Services
          </h1>
          <LotusSeparator className="mx-auto -mt-2 max-w-[220px] xl:max-w-[280px]" />
          <p className="text-surface/75 mx-auto mt-4 max-w-xl text-base leading-relaxed">
            Explore our full menu of spa and salon experiences. Select a service
            to view options and book your appointment.
          </p>
        </header>
      )}

      {isSearching && (
        <h2 className="text-surface mb-4 px-6 font-serif text-xl md:mb-6 md:text-3xl lg:mb-8 lg:px-16 lg:pt-2">
          Search Results
        </h2>
      )}

      <div
        className={`mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:grid-cols-3 md:gap-8 md:px-12 md:pb-6 lg:grid-cols-4 lg:gap-5 lg:px-16 lg:pb-12 xl:max-w-7xl xl:grid-cols-5 xl:gap-6 xl:px-20 ${
          isSearching ? "mt-0" : "mt-4 md:mt-12 lg:mt-0"
        }`}
      >
        {loading && (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}
        {error && (
          <p className="col-span-full py-8 text-center text-red-500">{error}</p>
        )}
        {!loading &&
          !error &&
          filteredServices.map((item) => (
            <Link
              key={item.id}
              href={`/service/${item.id}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm transition-all group-hover:scale-[1.02] lg:aspect-[4/5] lg:rounded-2xl lg:shadow-md lg:group-hover:shadow-lg">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 lg:group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute right-2 bottom-4 left-2 text-center md:right-6 md:bottom-8 md:left-6 md:text-left lg:right-3 lg:bottom-4 lg:left-3">
                  <h3 className="font-serif text-sm leading-tight font-medium text-white drop-shadow-md md:text-2xl lg:text-base xl:text-lg">
                    {item.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        {!loading && !error && filteredServices.length === 0 && (
          <p className="text-text-secondary col-span-full py-8 text-center">
            {query.trim() ? "No items found." : "No services available."}
          </p>
        )}
      </div>
    </div>
  );
}
