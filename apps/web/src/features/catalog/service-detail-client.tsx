"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceBookingWizard } from "@/features/booking/service-booking-wizard";
import {
  useBookingDraftStore,
  type DraftService,
} from "@/shared/store/booking-draft";
import { Item, ItemVariant } from "@/shared/types";
import { ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react";

function serviceLineTotal(item: Item, options: ItemVariant[]) {
  if (options.length > 0) {
    return options.reduce((sum, opt) => sum + opt.price, 0);
  }
  return item.price;
}

export function ServiceDetailClient({ item }: { item: Item }) {
  const router = useRouter();
  const draftServices = useBookingDraftStore((s) => s.services);
  const upsertService = useBookingDraftStore((s) => s.upsertService);
  const removeService = useBookingDraftStore((s) => s.removeService);
  const clearDraft = useBookingDraftStore((s) => s.clear);

  const existing = draftServices.find((s) => s.item.id === item.id);
  const [selectedOptions, setSelectedOptions] = useState<ItemVariant[]>(
    () => existing?.selectedOptions ?? []
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const match = useBookingDraftStore
      .getState()
      .services.find((s) => s.item.id === item.id);
    setSelectedOptions(match?.selectedOptions ?? []);
  }, [item.id]);

  const hasCatalogOptions = Boolean(item.options && item.options.length > 0);
  const currentTotal = useMemo(
    () => serviceLineTotal(item, selectedOptions),
    [item, selectedOptions]
  );
  const canProceed = hasCatalogOptions ? selectedOptions.length > 0 : true;
  const showBookingBar = canProceed;

  const otherDraftServices = draftServices.filter((s) => s.item.id !== item.id);

  const bookingServices: DraftService[] = useMemo(() => {
    const current: DraftService = {
      item,
      selectedOptions: hasCatalogOptions ? selectedOptions : [],
      totalPrice: currentTotal,
    };
    const others = draftServices.filter((s) => s.item.id !== item.id);
    return [...others, current];
  }, [draftServices, item, selectedOptions, hasCatalogOptions, currentTotal]);

  const bookingTotal = useMemo(
    () => bookingServices.reduce((sum, s) => sum + s.totalPrice, 0),
    [bookingServices]
  );

  const toggleAddon = (option: ItemVariant) => {
    setSelectedOptions((prev) =>
      prev.find((a) => a.id === option.id)
        ? prev.filter((a) => a.id !== option.id)
        : [...prev, option]
    );
  };

  const saveCurrent = () => {
    if (!canProceed) return false;
    upsertService(item, hasCatalogOptions ? selectedOptions : []);
    return true;
  };

  const openPicker = async () => {
    if (!saveCurrent()) return;
    setPickerOpen(true);
    setCatalogError(null);
    setCatalogLoading(true);
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load services");
      const items = (await res.json()) as Item[];
      setCatalog(items.filter((s) => !s.isProduct));
    } catch (err) {
      setCatalogError(
        err instanceof Error ? err.message : "Failed to load services"
      );
    } finally {
      setCatalogLoading(false);
    }
  };

  const pickService = (next: Item) => {
    setPickerOpen(false);
    if (next.id === item.id) return;
    router.push(`/service/${next.id}`);
  };

  const handleContinueBooking = () => {
    if (!saveCurrent()) return;
    setBookingOpen(true);
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
          <div className="border-primary/10 aspect-square w-full max-w-2xl shrink-0 overflow-hidden rounded-[40px] border bg-white shadow-lg lg:w-1/2">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover p-4 lg:object-contain"
            />
          </div>
          <div className="flex w-full max-w-2xl flex-col text-left lg:w-1/2">
            <h1 className="text-primary-dark mb-4 font-serif text-3xl font-medium lg:text-5xl">
              {item.name}
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface absolute inset-0 z-40 flex min-h-0 flex-col overflow-hidden lg:flex-row">
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
            <div className="mt-6 hidden lg:block xl:mt-10">
              <p className="max-w-xl text-lg leading-relaxed text-white/80 xl:text-xl">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-4xl bg-gray-50 lg:mt-0 lg:w-1/2 lg:rounded-none lg:bg-white">
        <div
          className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-7 sm:px-6 sm:pt-8 md:px-10 md:pt-12 lg:px-12 lg:pt-14 xl:px-16 xl:pt-16 ${showBookingBar ? "pb-48 sm:pb-44" : "pb-10"}`}
          data-lenis-prevent
        >
          <div className="prose prose-sm text-text-secondary mb-6 leading-relaxed lg:hidden">
            <p className="text-[15px] md:text-base">{item.description}</p>
          </div>

          {otherDraftServices.length > 0 && (
            <div className="border-primary/15 mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <p className="text-text-secondary mb-2 text-[11px] font-semibold tracking-wider uppercase">
                Also booking
              </p>
              <ul className="space-y-2">
                {otherDraftServices.map((entry) => (
                  <li
                    key={entry.item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-primary-dark truncate text-sm font-medium">
                        {entry.item.name}
                      </p>
                      {entry.selectedOptions.length > 0 && (
                        <p className="text-text-secondary truncate text-xs">
                          {entry.selectedOptions.map((o) => o.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(entry.item.id)}
                      className="text-text-secondary hover:text-primary-dark shrink-0 rounded-full p-1"
                      aria-label={`Remove ${entry.item.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                      className={`flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5 md:p-6 lg:rounded-3xl lg:p-7 ${
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
                        className={`inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full border text-sm font-medium sm:h-11 sm:w-auto sm:min-w-[7.5rem] sm:rounded-xl sm:px-6 md:min-w-[8.5rem] md:text-base lg:h-12 lg:min-w-[9.5rem] ${
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
            className="border-primary/10 fixed inset-x-0 bottom-0 z-40 border-t bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:px-6 sm:py-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:px-10 lg:py-5"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="text-text-secondary text-[11px] font-medium tracking-wider uppercase sm:text-xs">
                  {bookingServices.length > 1
                    ? `${bookingServices.length} services`
                    : hasCatalogOptions
                      ? `${selectedOptions.length} option${selectedOptions.length > 1 ? "s" : ""} selected`
                      : "Book this service"}
                </p>
                <p className="text-primary-dark font-serif text-xl font-bold sm:text-2xl">
                  QAR {bookingTotal}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => void openPicker()}
                  className="border-primary/30 text-primary hover:bg-primary/5 flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-full border bg-white px-5 text-sm font-medium transition-all sm:h-auto sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Add services
                </button>
                <button
                  type="button"
                  onClick={handleContinueBooking}
                  className="bg-primary flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 sm:h-auto sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                >
                  Continue booking
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-primary/10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border bg-white shadow-2xl sm:rounded-3xl">
            <div className="border-primary/10 flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-primary-dark font-serif text-lg font-semibold">
                  Add another service
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  Choose a service to add to this booking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-text-secondary hover:text-primary-dark rounded-full p-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4">
              {catalogLoading ? (
                <div className="text-text-secondary flex items-center justify-center gap-2 py-16">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading services…
                </div>
              ) : catalogError ? (
                <p className="py-12 text-center text-sm text-red-500">
                  {catalogError}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {catalog.map((svc) => {
                    const alreadyAdded = draftServices.some(
                      (s) => s.item.id === svc.id
                    );
                    const isCurrent = svc.id === item.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => pickService(svc)}
                        className={`group relative overflow-hidden rounded-2xl text-left transition-all ${
                          isCurrent
                            ? "cursor-default opacity-50"
                            : "hover:scale-[1.02] hover:shadow-md"
                        }`}
                      >
                        <div className="relative aspect-[3/4] w-full">
                          <img
                            src={svc.imageUrl}
                            alt={svc.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                          <div className="absolute inset-x-2 bottom-3 text-center">
                            <p className="font-serif text-sm leading-tight font-medium text-white drop-shadow">
                              {svc.name}
                            </p>
                            {(alreadyAdded || isCurrent) && (
                              <p className="mt-1 text-[10px] font-semibold tracking-wide text-white/90 uppercase">
                                {isCurrent ? "Current" : "Added"}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ServiceBookingWizard
        services={bookingServices}
        total={bookingTotal}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => {
          clearDraft();
          setSelectedOptions([]);
          setBookingOpen(false);
        }}
      />
    </div>
  );
}
