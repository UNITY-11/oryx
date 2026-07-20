"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeroCarousel } from "@/features/catalog/hero-carousel";
import { useCatalog } from "@/features/catalog/use-catalog";
import { TestimonialCarousel } from "@/features/home/testimonial-carousel";
import { LotusSeparator } from "@/shared/ui/lotus-separator";
import { useUserStore } from "@/shared/store";
import {
  Bath,
  Brush,
  Droplets,
  Flower2,
  Heart,
  Loader2,
  Scissors,
  Search,
  Sparkles,
  User,
  Wind,
} from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const logoRef = useRef<HTMLImageElement>(null);
  const user = useUserStore((state) => state.user);
  const { items, loading, error } = useCatalog();

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

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Header & Search in a zero-height fixed wrapper to prevent layout shift */}
      <div className="fixed top-0 left-0 z-40 h-0 w-full overflow-visible md:hidden">
        <div className="rounded-b-[36px] bg-[#e8baa0] px-4 pt-3 pb-3">
          <div className="min-h-4xl mb-4 flex items-center justify-center">
            <img
              ref={logoRef}
              src="/images/oryx-logo.png"
              alt="ORYX Logo"
              className="w-auto object-contain brightness-160 contrast-125 will-change-[height]"
              style={{ height: "100px" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#e8baa0]" />
              <input
                type="text"
                placeholder="Search treatments or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="placeholder:text-[#e8baa0] focus:ring-[#e8baa0] w-full rounded-full border border-[#e5c37a] bg-gray-50 py-3.5 pr-4 pl-12 text-sm transition-shadow outline-none focus:ring-2"
              />
            </div>
            <Link
              href="/profile"
              className="text-[#e8baa0] hover:text-[#c29a63] flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#e5c37a] bg-gray-50 transition-colors"
            >
              {user ? (
                <span className="text-xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Static spacer to push content below the large header initially */}
      <div className="pt-[190px] md:pt-0" />

      {/* Hero Carousel */}
      {!searchQuery && (
        <section className="mt-3 px-3 pb-6 md:mt-0 md:px-0 md:pb-24">
          <HeroCarousel />
        </section>
      )}

      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-8 px-3 pb-6 md:space-y-24 md:px-8 md:pb-24 lg:px-12 xl:px-16">
        {/* Categories Section */}
        {!searchQuery && (
          <section>
            <div className="mb-2 text-center">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                Categories
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
            </div>
            <div className="scrollbar-hide cat-container flex w-full flex-row justify-between overflow-x-auto px-3 pb-4 md:mx-0 md:overflow-visible md:px-0">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @media (max-width: 767px) {
                  .cat-container { gap: 16px !important; }
                }
                @media (min-width: 768px) {
                  .cat-circle { width: clamp(80px, 8vw, 110px) !important; height: clamp(80px, 8vw, 110px) !important; }
                  .cat-icon { width: clamp(40px, 4vw, 55px) !important; height: clamp(40px, 4vw, 55px) !important; }
                  .cat-text { font-size: clamp(12px, 1.2vw, 15px) !important; }
                }
                @media (min-width: 1024px) {
                  .cat-circle { width: clamp(100px, 9vw, 130px) !important; height: clamp(100px, 9vw, 130px) !important; }
                  .cat-icon { width: clamp(50px, 4.5vw, 65px) !important; height: clamp(50px, 4.5vw, 65px) !important; }
                  .cat-text { font-size: clamp(14px, 1.2vw, 17px) !important; }
                }
              `,
                }}
              />
              {[
                {
                  name: "Massage",
                  icon: <Flower2 className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Facial",
                  icon: <Sparkles className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Nails",
                  icon: <Scissors className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Therapy",
                  icon: <Droplets className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Hair Care",
                  icon: <Wind className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Makeup",
                  icon: <Brush className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Wellness",
                  icon: <Heart className="cat-icon h-6 w-6" />,
                },
                {
                  name: "Spa Bath",
                  icon: <Bath className="cat-icon h-6 w-6" />,
                },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="group flex w-[72px] flex-none cursor-pointer flex-col items-center md:w-auto"
                >
                  <div className="bg-white text-[#d6a488] hover:bg-gray-50 cat-circle flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#e5c37a] shadow-sm transition-colors hover:shadow-md">
                    {cat.icon}
                  </div>
                  <span className="text-white cat-text mt-2 text-center text-[11px] font-medium md:mt-4">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        {!searchQuery && (
          <section>
            <div className="scrollbar-hide -mx-3 flex space-x-4 overflow-x-auto px-3 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:space-x-0 md:px-0">
              {/* Card 1 */}
              <div className="bg-white border-primary/15 relative w-[92%] flex-none overflow-hidden rounded-2xl border shadow-md md:w-full">
                {/* Inner Dashed container */}
                <div className="border-primary/30 relative m-2 flex items-center justify-between overflow-hidden rounded-xl border-2 border-dashed p-4">
                  <div className="bg-primary/20 absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl" />

                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                      <Scissors className="h-3.5 w-3.5" /> SPECIAL OFFER
                    </span>
                    <h3 className="text-primary mb-1 font-serif text-lg leading-tight">
                      Get 20% Off Your First Visit
                    </h3>
                  </div>

                  {/* Vertical Dashed separator */}
                  <div className="border-primary/30 relative z-10 mx-2 h-16 w-px border-l-2 border-dashed" />

                  <div className="relative z-10 flex flex-col items-center justify-center pl-2 text-center">
                    <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                      Use Code
                    </p>
                    <strong className="text-primary border-primary/20 inline-block rounded-md border bg-[#fcf4f0] px-2.5 py-1 font-mono text-sm tracking-wider shadow-sm">
                      ORYX20
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white relative w-[92%] flex-none overflow-hidden rounded-2xl border border-[#c29a63]/20 shadow-md md:w-full">
                {/* Inner Dashed container */}
                <div className="relative m-2 flex items-center justify-between overflow-hidden rounded-xl border-2 border-dashed border-[#c29a63]/30 p-4">
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-[#c29a63]/20 blur-2xl" />

                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                      <Sparkles className="h-3.5 w-3.5" /> FREE GIFT
                    </span>
                    <h3 className="text-primary mb-1 font-serif text-lg leading-tight">
                      Free Polish With Manicure
                    </h3>
                  </div>

                  {/* Vertical Dashed separator */}
                  <div className="relative z-10 mx-2 h-16 w-px border-l-2 border-dashed border-[#c29a63]/30" />

                  <div className="relative z-10 flex flex-col items-center justify-center pl-2 text-center">
                    <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                      Use Code
                    </p>
                    <strong className="text-primary inline-block rounded-md border border-[#c29a63]/20 bg-[#fcf4f0] px-2.5 py-1 font-mono text-sm tracking-wider shadow-sm">
                      GLOWUP
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 3 (Bridal Spa Day) */}
              <div className="bg-white border-primary/15 relative w-[92%] flex-none overflow-hidden rounded-2xl border shadow-md md:w-full">
                <div className="border-primary/30 relative m-2 flex items-center justify-between overflow-hidden rounded-xl border-2 border-dashed p-4">
                  <div className="bg-primary/20 absolute top-0 left-0 -mt-10 -ml-10 h-32 w-32 rounded-full blur-2xl" />
                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                      <Flower2 className="h-3.5 w-3.5" /> PACKAGE
                    </span>
                    <h3 className="text-primary mb-1 font-serif text-lg leading-tight">
                      Bridal Spa Day
                    </h3>
                  </div>
                  <div className="border-primary/30 relative z-10 mx-2 h-16 w-px border-l-2 border-dashed" />
                  <div className="relative z-10 flex flex-col items-center justify-center pl-2 text-center">
                    <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                      Use Code
                    </p>
                    <strong className="text-primary border-primary/20 inline-block rounded-md border bg-[#fcf4f0] px-2.5 py-1 font-mono text-sm tracking-wider shadow-sm">
                      BRIDE30
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Catalog loading / error */}
        {(loading || error) && !searchQuery && (
          <>
            <section>
              <div className="mb-2 text-center">
                <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                  Featured Services
                </h2>
                <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
              </div>
              <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={`service-skeleton-${i}`} className="w-[44%] flex-none md:w-80">
                    <div className="relative flex h-56 w-full items-center justify-center rounded-t-full rounded-b-2xl border-2 border-[#e5c37a] bg-primary/5 shadow-sm md:h-96 overflow-hidden">
                      {loading ? (
                        <>
                          <div className="absolute inset-0 bg-primary/20" />
                          <div className="animate-[shimmer_2s_infinite] absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center z-10">
                          <span className="mb-2 text-[#c8a24a]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                          </span>
                          <span className="text-xs text-[#c8a24a] md:text-sm">Failed to load</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <span className="text-white text-sm font-semibold">
                  See All
                </span>
              </div>
            </section>

            <section className="mt-8 md:mt-24">
              <div className="mb-2 text-center">
                <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                  Our Products
                </h2>
                <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-3 md:gap-6 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={`product-skeleton-${i}`} className="bg-surface flex flex-col overflow-hidden rounded-2xl shadow-sm">
                    <div className="relative flex aspect-square items-center justify-center bg-primary/5 overflow-hidden">
                      {loading ? (
                        <>
                          <div className="absolute inset-0 bg-primary/20" />
                          <div className="animate-[shimmer_2s_infinite] absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center z-10">
                          <span className="mb-2 text-[#c8a24a]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                          </span>
                          <span className="text-xs text-[#c8a24a] md:text-sm">Failed to load</span>
                        </div>
                      )}
                    </div>
                    <div className="relative flex flex-col p-3 md:p-6 overflow-hidden">
                      <div className="h-4 w-2/3 rounded bg-primary/20" />
                      {loading && (
                        <div className="animate-[shimmer_2s_infinite] absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <span className="text-white text-sm font-semibold">
                  Show All
                </span>
              </div>
            </section>
          </>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section>
            <h2 className="text-surface mb-4 font-serif text-xl md:text-3xl">
              Search Results
            </h2>
            <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 pb-4">
              {loading && (
                <div className="text-text-secondary flex w-full items-center justify-center gap-2 py-8 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin" /> Searching...
                </div>
              )}
              {!loading &&
                filteredItems.map((item) => (
                  <Link
                    href={`/service/${item.id}`}
                    key={item.id}
                    className="group block w-44 flex-none"
                  >
                    <div className="relative h-56 w-full overflow-hidden rounded-2xl shadow-sm transition-transform group-hover:scale-[1.02]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <h3 className="absolute right-4 bottom-4 left-4 font-serif text-lg leading-tight font-medium text-white drop-shadow-md">
                        {item.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              {!loading && filteredItems.length === 0 && (
                <p className="text-text-secondary w-full py-8 text-center">
                  No items found.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Featured Services */}
        {!searchQuery && !loading && !error && (
          <section>
            <div className="mb-2 text-center">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                Featured Services
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
            </div>
            <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 pb-4">
              {filteredItems.filter((item) => !item.isProduct).length === 0 ? (
                <p className="text-text-secondary w-full py-8 text-center text-sm">
                  No services available yet.
                </p>
              ) : (
                filteredItems
                  .filter((item) => !item.isProduct)
                  .map((item) => (
                    <Link
                      href={`/service/${item.id}`}
                      key={item.id}
                      className="group block w-[44%] flex-none md:w-80"
                    >
                      <div className="relative h-56 w-full overflow-hidden rounded-t-full rounded-b-2xl border-2 border-[#e5c37a] shadow-sm md:h-96">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <h3 className="absolute right-4 bottom-4 left-4 text-center font-serif text-lg leading-tight font-medium text-white drop-shadow-md">
                          {item.name}
                        </h3>
                      </div>
                    </Link>
                  ))
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href="/services"
                className="text-white text-sm font-semibold"
              >
                See All
              </Link>
            </div>
          </section>
        )}

        {/* Products Section */}
        {!searchQuery && !loading && !error && (
          <section>
            <div className="mb-2 text-center">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                Our Products
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[120px] md:max-w-[200px]" />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-3 md:gap-6">
              {filteredItems.filter((item) => item.isProduct).length === 0 ? (
                <p className="text-text-secondary col-span-2 py-8 text-center text-sm md:col-span-3">
                  No products available yet.
                </p>
              ) : (
                filteredItems
                  .filter((item) => item.isProduct)
                  .slice(0, 6)
                  .map((item) => (
                    <Link
                      href={`/service/${item.id}`}
                      key={item.id}
                      className="bg-surface flex flex-col overflow-hidden rounded-2xl shadow-sm transition-transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col p-3 md:p-6">
                        <h3 className="text-text-primary line-clamp-1 font-serif text-sm leading-tight font-medium md:text-xl">
                          {item.name}
                        </h3>
                      </div>
                    </Link>
                  ))
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/products"
                className="text-white text-sm font-semibold"
              >
                Show All
              </Link>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {!searchQuery && (
          <section className="mt-16 md:mt-28">
            <div className="mb-8 flex flex-col items-center justify-center">
              <h2 className="text-surface font-serif text-2xl font-semibold md:text-4xl">
                Customer Reviews
              </h2>
              <LotusSeparator className="mx-auto -mt-4 w-3/4 max-w-[160px] md:max-w-[200px]" />
            </div>

            <div className="flex w-full justify-center pt-2 pb-8">
              <TestimonialCarousel />
            </div>
          </section>
        )}

        {/* Footer */}
        {!searchQuery && (
          <section className="mt-20 flex w-full flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex gap-4">
                <a
                  href="#"
                  className="bg-white border-primary/20 text-[#e8baa0] hover:bg-primary hover:border-primary flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all hover:text-white"
                >
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
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white border-primary/20 text-[#e8baa0] hover:bg-primary hover:border-primary flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all hover:text-white"
                >
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
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white border-primary/20 text-[#e8baa0] hover:bg-primary hover:border-primary flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all hover:text-white"
                >
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
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>

              <div className="text-white flex gap-4 text-xs font-medium">
                <Link href="/privacy" className="hover:text-white/80">
                  Privacy Policy
                </Link>
                <span className="text-primary/40">•</span>
                <Link href="/terms" className="hover:text-white/80">
                  Terms of Service
                </Link>
                <span className="text-primary/40">•</span>
                <Link href="/contact" className="hover:text-white/80">
                  Contact
                </Link>
              </div>

              <p className="text-white mt-4 text-[10px] md:text-xs">
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
