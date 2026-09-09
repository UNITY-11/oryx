"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceBookingWizard } from "@/features/booking/service-booking-wizard";
import { Item, ItemVariant } from "@/shared/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ServiceDetailClient({ item }: { item: Item }) {
  const router = useRouter();

  const [selectedOptions, setSelectedOptions] = useState<ItemVariant[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const total = useMemo(
    () => selectedOptions.reduce((sum, opt) => sum + opt.price, 0),
    [selectedOptions]
  );

  const hasCatalogOptions = item.options && item.options.length > 0;
  const bookingTotal = hasCatalogOptions ? total : item.price;
  const showBookingBar =
    !bookingOpen && (hasCatalogOptions ? selectedOptions.length > 0 : true);

  const toggleAddon = (option: ItemVariant) => {
    setSelectedOptions((prev) =>
      prev.find((a) => a.id === option.id)
        ? prev.filter((a) => a.id !== option.id)
        : [...prev, option]
    );
  };

  if (item.isProduct) {
    return (
      <div className="bg-surface absolute inset-0 z-40 flex flex-col overflow-y-auto px-6 pt-8 pb-24 md:px-12 md:pt-12 lg:px-24">
        <button
          onClick={() => router.back()}
          className="border-primary/20 text-primary-dark hover:bg-primary/10 absolute top-6 left-6 z-10 rounded-full border bg-black/5 p-2.5 transition-colors md:top-8 md:left-8 md:p-3"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-8 lg:mt-16 lg:flex-row lg:items-start lg:gap-16">
          {/* Mobile/Tablet Title */}
          <div className="mt-12 w-full text-center md:mt-0 lg:hidden">
            <h1 className="text-primary-dark mb-2 font-serif text-3xl font-medium md:text-5xl">
              {item.name}
            </h1>
            <div className="text-primary mb-6 text-xl font-medium">
              QAR {item.price}
            </div>
          </div>

          {/* Left Column: Product Image */}
          <div className="border-primary/10 aspect-square w-full max-w-2xl shrink-0 overflow-hidden rounded-[40px] border bg-white shadow-lg lg:w-1/2">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover p-4 lg:object-contain"
            />
          </div>

          {/* Right Column: Product Details */}
          <div className="flex w-full max-w-2xl flex-col text-left lg:w-1/2">
            {/* Desktop Title & Price */}
            <div className="mb-8 hidden lg:block">
              <h1 className="text-primary-dark mb-4 font-serif text-5xl font-medium">
                {item.name}
              </h1>
              <div className="text-primary text-3xl font-medium">
                QAR {item.price}
              </div>
            </div>

            <div className="border-primary/10 mb-8 w-full rounded-[32px] border bg-white p-8 shadow-sm md:p-10">
              <h2 className="text-primary-dark mb-4 flex items-center font-serif text-xl md:text-2xl">
                <span className="bg-primary/30 mr-4 h-px w-8"></span>
                About the Product
              </h2>
              <p className="text-text-secondary text-base leading-relaxed md:text-lg">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface absolute inset-0 z-40 flex min-h-0 flex-col overflow-hidden lg:flex-row">
      {/* Left Column (Desktop) / Header Image (Mobile) */}
      <div className="relative h-[28vh] min-h-[180px] flex-none sm:h-[32vh] md:h-[42vh] lg:h-full lg:min-h-0 lg:w-1/2 lg:p-8 xl:p-12">
        <div className="relative h-full w-full overflow-hidden lg:rounded-[48px] lg:shadow-xl">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

          <button
            type="button"
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:top-6 sm:left-6 md:top-8 md:left-8 md:p-3"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="absolute inset-x-4 bottom-8 sm:inset-x-6 sm:bottom-10 md:inset-x-10 lg:top-1/2 lg:right-10 lg:bottom-auto lg:left-10 lg:-translate-y-1/2 xl:right-12 xl:left-12">
            <h1 className="mb-1 font-serif text-2xl leading-tight font-medium break-words text-white sm:mb-2 sm:text-3xl md:mb-4 md:text-5xl lg:text-6xl xl:text-7xl">
              {item.name}
            </h1>

            {/* Desktop Description */}
            <div className="mt-6 hidden lg:block xl:mt-10">
              <p className="max-w-xl text-lg leading-relaxed text-white/80 xl:text-xl xl:leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop) / Content Container (Mobile) */}
      <div
        className={`relative z-10 -mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-4xl bg-gray-50 lg:mt-0 lg:w-1/2 lg:rounded-none lg:bg-white ${showBookingBar ? "pb-0" : ""}`}
      >
        <div
          className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-7 sm:px-6 sm:pt-8 md:px-10 md:pt-12 lg:px-12 lg:pt-14 xl:px-16 xl:pt-16 ${showBookingBar ? "pb-36 sm:pb-32 md:pb-28 lg:pb-36" : "pb-10 sm:pb-12 md:pb-16"}`}
          data-lenis-prevent
        >
          {/* Mobile Description */}
          <div className="prose prose-sm text-text-secondary mb-6 leading-relaxed sm:mb-8 lg:hidden">
            <p className="text-[15px] md:text-base">{item.description}</p>
          </div>

          {/* Service Options */}
          {item.options && item.options.length > 0 && (
            <div className="mb-8 w-full max-w-2xl md:mb-12 lg:mx-auto lg:mb-0">
              <h2 className="text-primary-dark mb-4 font-serif text-xl font-medium sm:mb-5 sm:text-2xl lg:mb-8 xl:text-3xl">
                Select Your Options
              </h2>
              <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4 lg:gap-5">
                {item.options.map((option) => {
                  const isSelected = selectedOptions.some(
                    (a) => a.id === option.id
                  );
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleAddon(option)}
                      aria-pressed={isSelected}
                      className={`flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5 md:rounded-2xl md:p-6 lg:gap-6 lg:rounded-3xl lg:p-7 ${
                        isSelected
                          ? "border-primary/50 ring-primary/20 ring-2"
                          : "border-gray-100 md:border-gray-200"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-text-primary block text-[15px] leading-snug font-medium break-words sm:text-base md:text-lg lg:text-xl">
                          {option.name}
                        </span>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-text-primary text-sm font-semibold sm:text-[15px] md:text-base lg:text-lg">
                            QAR {option.price}
                          </span>
                          {option.duration && (
                            <span className="text-text-secondary border-l border-gray-200 pl-2 text-xs sm:text-sm lg:text-base">
                              {option.duration} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors sm:h-11 sm:w-auto sm:min-w-[7.5rem] sm:rounded-xl sm:px-6 md:min-w-[8.5rem] md:px-8 md:text-base lg:h-12 lg:min-w-[9.5rem] lg:px-10 ${
                          isSelected
                            ? "border-primary text-primary bg-primary/5"
                            : "text-text-secondary border-gray-200 bg-white"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {showBookingBar && (
          <div
            className="border-primary/10 fixed inset-x-0 bottom-0 z-40 border-t bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:px-6 sm:py-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:px-10 lg:py-5 xl:px-14"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                {hasCatalogOptions ? (
                  <p className="text-text-secondary text-[11px] font-medium tracking-wider uppercase sm:text-xs lg:text-sm">
                    {selectedOptions.length} option
                    {selectedOptions.length > 1 ? "s" : ""} selected
                  </p>
                ) : (
                  <p className="text-text-secondary text-[11px] font-medium tracking-wider uppercase sm:text-xs lg:text-sm">
                    Book this service
                  </p>
                )}
                <p className="text-primary-dark font-serif text-xl font-bold sm:text-2xl lg:text-3xl">
                  QAR {bookingTotal}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="bg-primary flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 sm:h-auto sm:w-auto sm:px-6 sm:py-3 sm:text-base lg:px-8 lg:py-3.5"
              >
                <span>Continue Booking</span>
                <ChevronRight className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ServiceBookingWizard
        item={item}
        selectedOptions={selectedOptions}
        total={bookingTotal}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => setSelectedOptions([])}
      />
    </div>
  );
}
