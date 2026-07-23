"use client";

import { useEffect, useState } from "react";
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
import { createBooking, updateBooking } from "./api";
import { Booking } from "./types";

interface BookingWizardProps {
  /** Optional existing data for edit flow */
  initialData?: Booking;
  /** Called when the wizard is submitted (add or edit) */
  onSubmit: (payload: Partial<Booking>) => Promise<void>;
  /** Cancel button pressed */
  onCancel: () => void;
  /** Current step (1‑3). Controlled via URL query */
  step: number;
  /** Update step (updates URL query) */
  setStep: (step: number) => void;
}

export function BookingWizard({
  initialData,
  onSubmit,
  onCancel,
  step,
  setStep,
}: BookingWizardProps) {
  // ---------- State ----------
  const [customerName, setCustomerName] = useState(
    initialData?.customerName ?? ""
  );
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  // Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialData?.time ?? null
  );

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ---------- Load services ----------
  useEffect(() => {
    setServicesLoading(true);
    fetchServices()
      .then((data) => {
        const activeServices = data.filter((s) => s.status === "Active");
        setServices(activeServices);
        if (initialData) {
          const sIds = initialData.services
            .map((bs) => activeServices.find((s) => s.name === bs.name)?.id)
            .filter(Boolean) as string[];
          setSelectedServiceIds(sIds);

          const aIds = initialData.services
            .flatMap((bs) => {
              const s = activeServices.find((srv) => srv.name === bs.name);
              return s
                ? bs.options.map(
                    (aname) => s.options.find((a) => a.name === aname)?.id
                  )
                : [];
            })
            .filter(Boolean) as string[];
          setSelectedOptions(aIds);
        }
      })
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedServicesList = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const basePrice = selectedServicesList.reduce(
    (sum, s) => sum + (s.price ?? 0),
    0
  );
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  // ---------- Calendar helpers ----------
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

  // ---------- Time slots ----------
  const generateTimeSlots = (date: Date | null) => {
    if (!date) return [];
    const day = date.getDate();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const allSlots = [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
      "05:30 PM",
      "06:00 PM",
      "06:30 PM",
      "07:00 PM",
      "07:30 PM",
      "08:00 PM",
      "08:30 PM",
    ];
    if (isWeekend) return allSlots.filter((_, i) => i % 2 === 0);
    else if (day % 3 === 0) return allSlots.slice(0, 10);
    else if (day % 3 === 1) return allSlots.slice(10, 20);
    else return allSlots;
  };

  const generateBookedSlots = (date: Date | null, slots: string[]) => {
    if (!date) return [];
    const day = date.getDate();
    return slots.filter((_, i) => (i + day) % 4 === 0);
  };

  const dynamicTimeSlots = generateTimeSlots(selectedDate);
  const dynamicBookedSlots = generateBookedSlots(
    selectedDate,
    dynamicTimeSlots
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
    if (!match) return timeLabel;
    let hours = Number(match[1]);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
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
    if (!selectedTime) {
      setSubmitError("Please select a time slot.");
      return;
    }
    const servicesPayload = selectedServicesList.map((service) => {
      const options = service.options.filter((a) =>
        selectedOptions.includes(a.id)
      );
      return { name: service.name, options: options.map((a) => a.name) };
    });
    const addonsCost = selectedServicesList.reduce((sum, service) => {
      const options = service.options.filter((a) =>
        selectedOptions.includes(a.id)
      );
      return sum + options.reduce((s, a) => s + a.price, 0);
    }, 0);
    const amount = basePrice + addonsCost;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        customerName,
        phone,
        services: servicesPayload,
        date: toIsoDate(selectedDate),
        time: to24Hour(selectedTime),
        status: "Confirmed",
        amount,
        ...(initialData ? { id: initialData.id } : {}),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save booking"
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
            id="booking-form"
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
                      placeholder="Search services..."
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
                                ? "border-[#e8baa0] bg-[#e8baa0]/5 shadow-sm"
                                : "border-primary/10 bg-white hover:border-[#e8baa0]/30"
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
                                <span className="text-primary text-sm font-medium">
                                  QAR {s.price ?? 0}
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
                                          ? "bg-[#e8baa0]/10"
                                          : "hover:bg-black/5"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                                          isAddonSelected
                                            ? "rotate-45 bg-[#e8baa0] text-white shadow-sm"
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
                                          className={`truncate pr-2 font-medium ${isAddonSelected ? "text-[#e8baa0]" : "text-primary-dark"}`}
                                        >
                                          {" "}
                                          {option.name}
                                        </span>
                                        <span className="text-text-secondary font-medium whitespace-nowrap">
                                          + QAR {option.price}
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
            {/* STEP 2: Date & Time */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                {/* Calendar Container */}
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
                        <div key={`blank-${b}`} className="h-8 md:h-10" />
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
                            className={`flex h-8 w-full items-center justify-center rounded-full text-sm transition-all md:h-10 ${
                              isPast
                                ? "cursor-not-allowed text-gray-300"
                                : "hover:bg-[#e8baa0]/20"
                            } ${
                              isSelected
                                ? "bg-[#e8baa0] font-medium text-white shadow-md"
                                : ""
                            } ${
                              isToday && !isSelected
                                ? "border border-[#e8baa0]/50 font-medium text-[#e8baa0]"
                                : ""
                            } ${
                              !isPast && !isSelected && !isToday
                                ? "text-text-primary"
                                : ""
                            } `}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Time Slots */}
                <div>
                  <div className="mt-4 mb-4 flex items-center justify-between">
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
                        const isBooked = dynamicBookedSlots.includes(t);
                        const isSelected = selectedTime === t;
                        return (
                          <button
                            type="button"
                            key={t}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(t)}
                            className={`rounded-2xl border py-2 text-sm font-medium transition-colors ${
                              isBooked
                                ? "border-transparent bg-gray-100 text-gray-400 opacity-40"
                                : isSelected
                                  ? "border-[#e8baa0] bg-[#e8baa0] text-white shadow-md"
                                  : "bg-surface text-text-primary border-[#e8baa0]/30 hover:border-[#e8baa0] hover:shadow-sm"
                            } `}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-text-secondary rounded-2xl border border-dashed bg-gray-50 py-6 text-center text-sm">
                      Please select a date to see available times.
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* STEP 3: Customer Details */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex min-h-[300px] flex-col justify-center duration-300">
                <div className="mx-auto w-full max-w-sm space-y-5">
                  <div>
                    <label className="text-primary-dark mb-1.5 block text-sm font-medium">
                      Customer Name
                    </label>
                    <input
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[0-9]/g, "");
                        setCustomerName(val);
                      }}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 shadow-sm transition-colors focus:bg-white focus:outline-none"
                      placeholder="e.g. Sarah Smith"
                    />
                  </div>
                  <div>
                    <label className="text-primary-dark mb-1.5 block text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[a-zA-Z]/g, "");
                        setPhone(val);
                      }}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 shadow-sm transition-colors focus:bg-white focus:outline-none"
                      placeholder="+974 5555 0000"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        {/* Right Side: Summary & Actions */}
        <div className="border-primary/10 flex w-full shrink-0 flex-col border-t bg-gray-50 md:w-[40%] md:border-t-0 md:border-l">
          <div className="flex min-h-0 flex-1 flex-col space-y-6 p-6">
            <h4 className="text-primary-dark shrink-0 font-serif text-lg">
              Summary
            </h4>
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
                          <span>QAR {service.price || 0}</span>
                        </div>
                        {serviceAddons.map((option) => (
                          <div
                            key={option.id}
                            className="text-text-secondary mt-1 flex justify-between pl-2 text-xs"
                          >
                            <span>+ {option.name}</span>
                            <span>QAR {option.price}</span>
                          </div>
                        ))}
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
                    QAR{" "}
                    {basePrice +
                      selectedServicesList.reduce((sum, service) => {
                        return (
                          sum +
                          service.options
                            .filter((a) => selectedOptions.includes(a.id))
                            .reduce((s, a) => s + a.price, 0)
                        );
                      }, 0)}
                  </p>
                </>
              )}
            </div>
            {step < 3 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && selectedServiceIds.length === 0) ||
                  (step === 2 && !selectedTime)
                }
                onClick={() => {
                  setSubmitError(null);
                  setStep(step + 1);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#e8baa0] px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next Step</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                form="booking-form"
                type="submit"
                disabled={
                  submitting ||
                  customerName.trim().length < 4 ||
                  phone.trim().length < 8
                }
                className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#e8baa0] px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
