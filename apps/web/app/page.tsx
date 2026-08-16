"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeroCarousel } from "@/features/catalog/hero-carousel";
import { useCatalog } from "@/features/catalog/use-catalog";
import { useHero } from "@/features/catalog/use-hero";
import { SocialLinks } from "@/features/company/social-links";
import { TestimonialCarousel } from "@/features/home/testimonial-carousel";
import { PromotionalBannerSection } from "@/features/promotional-banner/promotional-banner";
import { useSearch } from "@/shared/providers/search-provider";
import { LotusSeparator } from "@/shared/ui/lotus-separator";
import { Loader2, Search } from "lucide-react";

// Special offers disabled for now
// import { useCoupons } from "@/features/home/use-coupons";

export default function HomePage() {
  const { query: searchQuery, setQuery: setSearchQuery } = useSearch();
  const logoRef = useRef<HTMLImageElement>(null);
  const { items, loading, error } = useCatalog();
  const { slides, loading: heroLoading } = useHero();
  // const { coupons, loading: couponsLoading } = useCoupons();

  useEffect(() => {
    const mainArea = document.getElementById("main-scroll-container");
    if (!mainArea) return;

    const handleScroll = () => {
      const scrollY = mainArea.scrollTop;

      const startHeight = 100;
      const endHeight = 54;

      // Reduce height by 1px for every 1px scrolled down, clamped to the endHeight
      const newHeight = Math.max(endHeight, startHeight - scrollY);

      if (logoRef.current) {
        logoRef.current.style.height = `${newHeight}px`;
      }
    };

    mainArea.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => mainArea.removeEventListener("scroll", handleScroll);
  }, []);

  const serviceItems = items.filter((item) => !item.isProduct);

  const filteredItems = serviceItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredItems = serviceItems.filter((item) => item.featured);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Header & Search in a zero-height fixed wrapper to prevent layout shift */}
      <div className="fixed top-0 left-0 z-40 h-0 w-full overflow-visible md:hidden">
        <div className="bg-fluted relative overflow-hidden rounded-b-[36px] border-x border-b border-[#c8a24a] px-4 pt-3 pb-4">
          {/* Metallic Gold Band */}
          <div className="absolute right-0 bottom-0 left-0 z-0 h-1.5 bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#b38728]" />
          <div className="min-h-4xl relative z-10 mb-4 flex w-full items-center justify-center px-4">
            <div
              ref={logoRef}
              className="w-full max-w-[250px] bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#b38728] drop-shadow-md will-change-[height]"
              title="ORYX Logo"
              style={{
                height: "100px",
                WebkitMaskImage: 'url("/images/oryx-logo.png")',
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: 'url("/images/oryx-logo.png")',
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            />
          </div>
          <div className="relative z-10">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#c8a24a]" />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#c8a24a] bg-gray-50 py-3.5 pr-4 pl-12 text-sm transition-shadow outline-none placeholder:text-[#c8a24a]/70 focus:ring-2 focus:ring-[#c8a24a]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Static spacer to push content below the large header initially */}
      <div className="pt-[200px] md:hidden" />

      {/* Hero Carousel */}
      {!searchQuery && (
        <section className="px-4 pt-4 pb-4 md:px-8 md:pt-[130px] md:pb-6 lg:p-0">
          {heroLoading ? (
            <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-black md:aspect-video md:h-auto md:rounded-[3rem] lg:aspect-auto lg:h-[100vh] lg:rounded-none">
              <img
                src="/images/hero/image.png"
                alt="Loading..."
                className="h-full w-full object-cover opacity-70"
              />
            </div>
          ) : (
            <HeroCarousel slides={slides} />
          )}
        </section>
      )}

      <div
        className={`mx-auto w-full max-w-screen-2xl flex-1 px-3 pb-0 md:px-8 md:pb-10 lg:max-w-7xl lg:px-12 lg:pb-8 xl:max-w-[90rem] xl:px-16 xl:pb-10 ${
          searchQuery
            ? "pt-0 md:pt-8 lg:pt-28 xl:pt-32"
            : "pt-0 md:pt-8 lg:pt-10"
        }`}
      >
        {/* Special Offers — disabled for now
        {!searchQuery && coupons.length > 0 && (
          <section className="pb-8 pt-2 md:py-16">
            ...
          </section>
        )}
        */}

        {/* Catalog loading / error */}
        {(loading || error) && !searchQuery && (
          <>
            <section className="section-padding">
              <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-12">
                <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                  Featured Services
                </h2>
                <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
              </div>
              <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`service-skeleton-${i}`}
                    className="w-[50%] flex-none md:w-80"
                  >
                    <div className="bg-primary/5 relative flex h-56 w-full items-center justify-center overflow-hidden rounded-t-full rounded-b-2xl border-2 border-[#e5c37a] shadow-sm md:h-96">
                      {loading ? (
                        <>
                          <div className="bg-primary/20 absolute inset-0" />
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        </>
                      ) : (
                        <div className="z-10 flex flex-col items-center justify-center p-4 text-center">
                          <span className="mb-2 text-[#c8a24a]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                          </span>
                          <span className="text-xs text-[#c8a24a] md:text-sm">
                            Failed to load
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <span className="text-sm font-semibold text-white">
                  See All
                </span>
              </div>
            </section>

            {/* Products loading skeleton — disabled for now
            <section className="section-padding">
              ...
            </section>
            */}
          </>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section className="section-padding !pt-0 lg:!pt-2">
            <h2 className="text-surface mb-4 font-serif text-xl md:mb-6 md:text-3xl lg:mb-8">
              Search Results
            </h2>
            {loading && (
              <div className="text-text-secondary flex w-full items-center justify-center gap-2 py-12 text-sm">
                <Loader2 className="h-5 w-5 animate-spin" /> Searching...
              </div>
            )}
            {!loading && filteredItems.length === 0 && (
              <p className="text-text-secondary w-full py-12 text-center">
                No items found.
              </p>
            )}
            {!loading && filteredItems.length > 0 && (
              <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-5 xl:max-w-7xl xl:grid-cols-5 xl:gap-6">
                {filteredItems.map((item) => (
                  <Link
                    href={`/service/${item.id}`}
                    key={item.id}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm transition-all group-hover:scale-[1.02] lg:aspect-[4/5] lg:rounded-2xl lg:shadow-md lg:group-hover:shadow-lg">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute right-2 bottom-4 left-2 text-center md:right-4 md:bottom-6 md:left-4 md:text-left lg:right-3 lg:bottom-4 lg:left-3">
                        <h3 className="font-serif text-sm leading-tight font-medium text-white drop-shadow-md md:text-xl lg:text-base xl:text-lg">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Services */}
        {!searchQuery && !loading && !error && featuredItems.length > 0 && (
          <section className="section-padding">
            <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-12 lg:mb-16">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl lg:text-5xl">
                Featured Services
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px] lg:max-w-[280px]" />
            </div>
            <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:flex lg:justify-center lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0">
              {featuredItems.map((item) => (
                <Link
                  href={`/service/${item.id}`}
                  key={item.id}
                  className="group flex w-[50%] flex-none flex-col md:w-80 lg:w-52 xl:w-60"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full rounded-b-2xl border-[3px] border-[#c8a24a] shadow-sm transition-transform lg:shadow-md lg:group-hover:-translate-y-1">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 w-[95%] max-w-full -translate-x-1/2 drop-shadow-md md:bottom-5 md:w-[90%]">
                      <div
                        className="animate-shine overflow-hidden bg-[#c8a24a] px-3 py-1.5 md:px-5"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%, 12px 50%)",
                        }}
                      >
                        <h3
                          className="truncate text-center font-serif text-[10px] leading-tight font-medium text-white sm:text-[11px] md:text-sm"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {!searchQuery && !loading && !error && serviceItems.length > 0 && (
          <section className="section-padding">
            <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-12 lg:mb-16">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl lg:text-5xl">
                Services
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px] lg:max-w-[280px]" />
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-5 xl:max-w-7xl xl:grid-cols-5 xl:gap-6">
              {serviceItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/service/${item.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm transition-all group-hover:scale-[1.02] lg:aspect-[4/5] lg:rounded-2xl lg:shadow-md lg:group-hover:shadow-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute right-2 bottom-4 left-2 text-center md:right-4 md:bottom-6 md:left-4 md:text-left lg:right-3 lg:bottom-4 lg:left-3">
                      <h3 className="font-serif text-sm leading-tight font-medium text-white drop-shadow-md md:text-xl lg:text-base xl:text-lg">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section — disabled for now
        {!searchQuery && !loading && !error && (
          <section className="section-padding">
            ...
          </section>
        )}
        */}

        {/* Promotional Banner */}
        {!searchQuery && <PromotionalBannerSection />}

        {/* Testimonials Section */}
        {!searchQuery && (
          <section className="section-padding">
            <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-12 lg:mb-16">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl lg:text-5xl">
                Customer Reviews
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px] lg:max-w-[280px]" />
            </div>

            <div className="flex w-full justify-center">
              <TestimonialCarousel />
            </div>
          </section>
        )}

        {/* Footer */}
        {!searchQuery && (
          <section className="flex w-full flex-col items-center justify-center py-8 md:py-10 lg:pt-14 lg:pb-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <SocialLinks variant="footer" className="justify-center" />

              <div className="flex gap-4 text-xs font-medium text-white">
                <Link href="/contact" className="hover:text-white/80">
                  Contact
                </Link>
              </div>

              <p className="mt-4 text-[10px] text-white md:text-xs">
                © {new Date().getFullYear()} ORYX Beauty Spa. All rights
                reserved.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
