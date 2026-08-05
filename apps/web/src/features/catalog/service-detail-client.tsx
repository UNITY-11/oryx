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
    <div className="bg-surface absolute inset-0 z-40 flex flex-col overflow-hidden lg:flex-row">
      {/* Left Column (Desktop) / Header Image (Mobile) */}
      <div className="relative h-[30vh] flex-none md:h-[45vh] lg:h-full lg:w-1/2 lg:p-10 xl:p-12">
        <div className="relative h-full w-full overflow-hidden lg:rounded-[48px] lg:shadow-xl">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 z-10 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/30 md:top-8 md:left-8 md:p-3"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="absolute right-6 bottom-10 left-6 md:right-12 md:left-12 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2">
            <h1 className="mb-2 font-serif text-3xl leading-tight font-medium text-white md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl">
              {item.name}
            </h1>

            {/* Desktop Description */}
            <div className="mt-8 hidden lg:block xl:mt-10">
              <p className="max-w-xl text-lg leading-relaxed text-white/80 xl:text-xl xl:leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop) / Content Container (Mobile) */}
      <div
        className={`relative z-10 -mt-6 flex flex-1 flex-col overflow-hidden rounded-t-4xl bg-gray-50 lg:mt-0 lg:w-1/2 lg:rounded-none lg:bg-white ${selectedOptions.length > 0 ? "pb-0" : ""}`}
      >
        <div
          className={`scrollbar-hide flex-1 overflow-y-auto overscroll-contain px-6 pt-8 md:px-16 md:pt-12 lg:px-16 lg:pt-14 xl:px-20 xl:pt-16 ${selectedOptions.length > 0 ? "pb-28 md:pb-16 lg:pb-32" : "pb-12 md:pb-16 lg:pb-16"}`}
          data-lenis-prevent
        >
          {/* Mobile Description */}
          <div className="prose prose-sm text-text-secondary mb-8 leading-relaxed lg:hidden">
            <p className="text-[15px] md:text-base">{item.description}</p>
          </div>

          {/* ServiceOptions */}
          {item.options && item.options.length > 0 && (
            <div className="mb-8 md:mb-12 lg:mx-auto lg:mb-0 lg:max-w-xl xl:max-w-2xl">
              <h2 className="text-primary-dark mb-6 hidden font-serif text-2xl font-medium lg:mb-8 lg:block xl:text-3xl">
                Select Your Options
              </h2>
              <div className="space-y-3 md:space-y-4 lg:space-y-5">
                {item.options.map((option) => {
                  const isSelected = selectedOptions.some(
                    (a) => a.id === option.id
                  );
                  return (
                    <div
                      key={option.id}
                      onClick={() => toggleAddon(option)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md md:rounded-2xl md:p-6 lg:rounded-3xl lg:p-7 xl:p-8 ${
                        isSelected
                          ? "border-primary/50 ring-primary/20 ring-1 md:ring-2 lg:ring-2"
                          : "border-gray-100 md:border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-text-primary mb-1 text-[15px] font-medium md:text-lg lg:text-xl">
                          {option.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary text-sm font-semibold md:text-base lg:text-lg">
                            QAR {option.price}
                          </span>
                          {option.duration && (
                            <span className="text-text-secondary border-l border-gray-200 pl-2 text-xs md:text-sm lg:text-base">
                              {option.duration} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`rounded-lg border px-5 py-1.5 text-sm font-medium transition-colors md:rounded-xl md:px-8 md:py-2.5 md:text-base lg:px-10 lg:py-3 lg:text-base ${
                          isSelected
                            ? "border-primary text-primary bg-primary/5"
                            : "text-text-secondary border-gray-200"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedOptions.length > 0 && !bookingOpen && (
          <div
            className="border-primary/10 fixed inset-x-0 bottom-0 z-40 border-t bg-white px-6 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:absolute lg:inset-x-0 lg:bottom-0 lg:border-t lg:px-12 lg:py-5 xl:px-16"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto flex max-w-lg items-center justify-between gap-4 lg:max-w-xl xl:max-w-2xl">
              <div>
                <p className="text-text-secondary text-xs font-medium tracking-wider uppercase lg:text-sm">
                  {selectedOptions.length} option
                  {selectedOptions.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-primary-dark font-serif text-2xl font-bold lg:text-3xl">
                  QAR {total}
                </p>
              </div>
              <button
                onClick={() => setBookingOpen(true)}
                className="bg-primary flex shrink-0 items-center rounded-full px-6 py-3 font-medium text-white shadow-md transition-all hover:opacity-90 lg:px-8 lg:py-3.5 lg:text-base"
              >
                Continue Booking
                <ChevronRight className="ml-1 h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ServiceBookingWizard
        item={item}
        selectedOptions={selectedOptions}
        total={total}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => setSelectedOptions([])}
      />
    </div>
  );
}
