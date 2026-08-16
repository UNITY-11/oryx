"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { validatePhoneValue } from "@/shared/lib/phone";
import {
  isBookingCustomerDetailsValid,
  validateCustomerName,
} from "@repo/validation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

import { fetchServices } from "../services/api";
import { Service } from "../services/types";
import { createBooking } from "./api";
import { filterServicesByQuery } from "./filter-services";
import {
  canProceedFromServicesStep,
  getSelectedServicesMissingOptions,
} from "./service-validation";
import { getTimeSlotsForDate } from "./time-slots";
import { Booking } from "./types";
import {
  BookingCustomerStep,
  type BookingCustomerStepState,
} from "./ui/booking-customer-step";

export function AddBookingView({
  onAddBooking,
  onCancel,
  step,
  setStep,
}: {
  onAddBooking: (booking: Booking) => void;
  onCancel: () => void;
  step: number;
  setStep: (step: number) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  // Date & Time State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customerStepState, setCustomerStepState] =
    useState<BookingCustomerStepState>({
      mode: "existing",
      selectedCustomerId: null,
    });

  const handleCustomerStepStateChange = useCallback(
    (state: BookingCustomerStepState) => {
      setCustomerStepState(state);
    },
    []
  );

  const customerNameError = useMemo(
    () => validateCustomerName(customerName),
    [customerName]
  );
  const customerPhoneError = useMemo(
    () => validatePhoneValue(phone, { required: true, label: "phone number" }),
    [phone]
  );
  const canConfirmCustomer =
    isBookingCustomerDetailsValid(customerName, phone) &&
    (customerStepState.mode === "new" ||
      customerStepState.selectedCustomerId !== null);

  useEffect(() => {
    setServicesLoading(true);
    fetchServices()
      .then((data) => setServices(data.filter((s) => s.status === "Active")))
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
  }, []);

  const selectedServicesList = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const optionsTotal = selectedServicesList.reduce((sum, service) => {
    return (
      sum +
      service.options
        .filter((a) => selectedOptions.includes(a.id))
        .reduce((s, a) => s + a.price, 0)
    );
  }, 0);
  const filteredServices = filterServicesByQuery(services, serviceSearchQuery);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const today = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const dynamicTimeSlots = getTimeSlotsForDate(selectedDate);
  const canProceedServices = canProceedFromServicesStep(
    selectedServiceIds,
    selectedOptions,
    services
  );

  const toIsoDate = (date: Date | null) => {
    const d = date || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const to24Hour = (timeLabel: string) => {
    if (!timeLabel) return "10:00";
    const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match || !match[1] || !match[2] || !match[3]) return timeLabel;
    let hours = Number(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      setSubmitError("Please select at least one service.");
      return;
    }
    const missingOptions = getSelectedServicesMissingOptions(
      selectedServiceIds,
      selectedOptions,
      services
    );
    if (missingOptions.length > 0) {
      setSubmitError(
        `Select service options for: ${missingOptions.join(", ")}.`
      );
      return;
    }
    if (!selectedTime) {
      setSubmitError("Please select a time slot.");
      return;
    }
    if (!canConfirmCustomer) {
      setSubmitError(
        customerStepState.mode === "existing" &&
          !customerStepState.selectedCustomerId
          ? "Select an existing customer or add a new one."
          : customerNameError ||
              customerPhoneError ||
              "Enter valid customer details."
      );
      return;
    }

    const servicesPayload = selectedServicesList.map((service) => {
      const options = service.options.filter((a) =>
        selectedOptions.includes(a.id)
      );
      return {
        name: service.name,
        options: options.map((a) => a.name),
      };
    });

    const amount = optionsTotal;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createBooking({
        customerName,
        phone,
        services: servicesPayload,
        date: toIsoDate(selectedDate),
        time: to24Hour(selectedTime),
        status: "Confirmed",
        amount,
      });

      onAddBooking(created);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddonToggle = (addonId: string) => {
    if (selectedOptions.includes(addonId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== addonId));
    } else {
      setSelectedOptions([...selectedOptions, addonId]);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Side: Wizard Forms */}
        <div className="scrollbar-hide relative w-full shrink-0 overflow-y-auto md:w-[60%]">
          <form
            id="add-booking-form"
            onSubmit={handleSubmit}
            className="space-y-8 p-6 md:p-8"
          >
            {/* STEP 1: Services */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex h-full flex-col duration-300">
                <div className="border-primary/5 sticky top-0 z-10 -mx-6 -mt-6 border-b bg-white px-6 pt-6 pb-4 md:-mx-8 md:-mt-8 md:px-8 md:pt-8">
                  <div className="relative">
                    <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="text"
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      placeholder="Search services or options..."
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 py-3 pr-4 pl-9 text-sm shadow-sm transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  {servicesLoading ? (
                    <div className="text-text-secondary flex items-center gap-2 px-4 py-3 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      services...
                    </div>
                  ) : servicesError ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" /> {servicesError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredServices.map((s) => {
                        const isSelected = selectedServiceIds.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            className={`flex flex-col rounded-2xl border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-primary/10 hover:border-primary/30 bg-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedServiceIds(
                                    selectedServiceIds.filter(
                                      (id) => id !== s.id
                                    )
                                  );
                                  // Also clear any selected options that belong to this service
                                  const removedAddonIds = s.options.map(
                                    (a) => a.id
                                  );
                                  setSelectedOptions((prev) =>
                                    prev.filter(
                                      (id) => !removedAddonIds.includes(id)
                                    )
                                  );
                                } else {
                                  setSelectedServiceIds([
                                    ...selectedServiceIds,
                                    s.id,
                                  ]);
                                }
                              }}
                              className="flex w-full items-center gap-3 p-3 text-left"
                            >
                              {s.image ? (
                                <img
                                  src={s.image}
                                  alt={s.name}
                                  className="h-12 w-12 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                    No img
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-primary-dark block truncate text-sm font-medium">
                                  {s.name}
                                </span>
                                <span className="text-text-secondary text-xs">
                                  {(s.options?.length ?? 0) > 0
                                    ? `From QAR ${Math.min(...s.options.map((o) => o.price))}`
                                    : "Select options"}
                                </span>
                              </div>
                            </button>

                            {isSelected && s.options.length > 0 && (
                              <div className="border-primary/5 mt-1 space-y-1 border-t px-3 pt-2 pb-3">
                                <p className="text-text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                                  Service Options
                                </p>
                                {s.options.map((option) => {
                                  const isAddonSelected =
                                    selectedOptions.includes(option.id);
                                  return (
                                    <button
                                      type="button"
                                      key={option.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddonToggle(option.id);
                                      }}
                                      className={`flex w-full cursor-pointer items-center space-x-3 rounded-xl p-2.5 transition-colors ${
                                        isAddonSelected
                                          ? "bg-primary/10"
                                          : "hover:bg-black/5"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                                          isAddonSelected
                                            ? "bg-primary rotate-45 text-white shadow-sm"
                                            : "border-primary/20 text-primary hover:border-primary/50 border bg-white"
                                        }`}
                                      >
                                        <Plus
                                          className="h-4 w-4"
                                          strokeWidth={
                                            isAddonSelected ? 2.5 : 2
                                          }
                                        />
                                      </div>
                                      <div className="flex flex-1 justify-between text-xs">
                                        <span
                                          className={`truncate pr-2 font-medium ${isAddonSelected ? "text-primary" : "text-primary-dark"}`}
                                        >
                                          {option.name}
                                        </span>
                                        <span className="text-text-secondary font-medium whitespace-nowrap">
                                          QAR {option.price}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredServices.length === 0 && (
                        <div className="text-text-secondary rounded-2xl border border-dashed bg-gray-50 py-6 text-center text-sm">
                          No services match your search.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Date */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-surface border-primary/10 overflow-hidden rounded-3xl border shadow-sm">
                  <div className="bg-primary/5 border-primary/10 flex items-center justify-between border-b p-5">
                    <h3 className="text-primary-dark font-serif text-lg font-semibold capitalize">
                      {currentMonth.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={isCurrentMonth}
                        className="border-primary/10 text-primary hover:bg-primary/5 rounded-full border bg-white p-2 shadow-sm transition-all disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="border-primary/10 text-primary hover:bg-primary/5 rounded-full border bg-white p-2 shadow-sm transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Calendar Grid */}
                    <div className="mb-2 grid grid-cols-7 gap-1">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-text-secondary py-1 text-center text-xs font-medium"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {blanks.map((b) => (
                        <div key={`blank-${b}`} className="h-8 md:h-10"></div>
                      ))}

                      {days.map((d) => {
                        const dateObj = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          d
                        );
                        const todayMidnight = new Date();
                        todayMidnight.setHours(0, 0, 0, 0);

                        const isPast = dateObj < todayMidnight;
                        const isSelected =
                          selectedDate &&
                          dateObj.toDateString() ===
                            selectedDate.toDateString();
                        const isToday =
                          dateObj.toDateString() === today.toDateString();

                        return (
                          <button
                            type="button"
                            key={d}
                            disabled={isPast}
                            onClick={() => {
                              setSelectedDate(dateObj);
                              setSelectedTime(null);
                            }}
                            className={`flex h-8 w-full items-center justify-center rounded-full text-sm transition-all md:h-10 ${isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-primary/20"} ${isSelected ? "bg-primary font-medium text-white shadow-md" : ""} ${isToday && !isSelected ? "border-primary/50 text-primary border font-medium" : ""} ${!isPast && !isSelected && !isToday ? "text-text-primary" : ""} `}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Time */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-primary-dark font-serif text-lg">
                    Available Times
                  </h3>
                  {selectedDate && (
                    <span className="text-text-secondary text-sm font-medium">
                      {selectedDate.toLocaleString("default", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {dynamicTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                    {dynamicTimeSlots.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`rounded-2xl border py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-white shadow-md"
                              : "bg-surface text-text-primary border-primary/30 hover:border-primary hover:shadow-sm"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-text-secondary rounded-2xl border border-dashed bg-gray-50 py-6 text-center text-sm">
                    Please select a date first.
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Client Details */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex min-h-[300px] flex-col justify-center duration-300">
                <BookingCustomerStep
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  phone={phone}
                  setPhone={setPhone}
                  nameError={customerNameError || undefined}
                  phoneError={customerPhoneError || undefined}
                  onStepStateChange={handleCustomerStepStateChange}
                />
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Summary & Actions */}
        <div className="border-primary/10 flex w-full shrink-0 flex-col border-t bg-gray-50 md:w-[40%] md:border-t-0 md:border-l">
          {/* Summary Area */}
          <div className="flex min-h-0 flex-1 flex-col space-y-6 p-6">
            <h4 className="text-primary-dark shrink-0 font-serif text-lg">
              Summary
            </h4>

            {/* Date & Time */}
            {selectedTime && selectedDate && (
              <div className="border-primary/10 shrink-0 rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-text-secondary mb-1 text-xs font-semibold tracking-wider uppercase">
                  Date & Time
                </p>
                <p className="text-primary-dark text-sm font-medium">
                  {selectedDate.toDateString()} at {selectedTime}
                </p>
              </div>
            )}

            {/* Selected Items */}
            {selectedServicesList.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-col space-y-3">
                <p className="text-text-secondary shrink-0 text-xs font-semibold tracking-wider uppercase">
                  Services
                </p>
                <div className="border-primary/10 scrollbar-hide flex-1 space-y-3 overflow-y-auto rounded-2xl border bg-white p-4 shadow-sm">
                  {selectedServicesList.map((service) => {
                    const serviceAddons = service.options.filter((a) =>
                      selectedOptions.includes(a.id)
                    );
                    return (
                      <div
                        key={service.id}
                        className="border-primary/10 border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="text-primary-dark flex justify-between text-sm font-medium">
                          <span>{service.name}</span>
                        </div>
                        {serviceAddons.map((option) => (
                          <div
                            key={option.id}
                            className="text-text-secondary mt-1 flex justify-between pl-2 text-xs"
                          >
                            <span>{option.name}</span>
                            <span className="text-primary-dark font-medium">
                              QAR {option.price}
                            </span>
                          </div>
                        ))}
                        {serviceAddons.length === 0 && (
                          <p className="text-text-secondary mt-1 pl-2 text-xs italic">
                            No options selected
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-text-secondary shrink-0 text-sm">
                No services selected yet.
              </div>
            )}
          </div>

          {/* Footer Area inside right bar */}
          <div className="border-primary/10 border-t bg-white p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="mb-4">
              {submitError ? (
                <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                </p>
              ) : (
                <>
                  <p className="text-text-secondary text-sm">
                    Total Estimated Amount
                  </p>
                  <p className="text-primary-dark font-serif text-2xl">
                    QAR {optionsTotal}
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {step < 4 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !canProceedServices) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedTime)
                }
                onClick={() => {
                  setSubmitError(null);
                  setStep(step + 1);
                }}
                className="bg-primary flex w-full items-center justify-center space-x-2 rounded-full px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next Step</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                form="add-booking-form"
                type="submit"
                disabled={submitting || !canConfirmCustomer}
                className="bg-primary flex w-full items-center justify-center space-x-2 rounded-full px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span>{submitting ? "Booking..." : "Confirm Booking"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
