"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { fetchServices } from "../services/api";
import { Service } from "../services/mock-data";
import { createBooking } from "./api";
import { Booking } from "./mock-data";

export function AddBookingView({
  onAddBooking,
  onCancel,
}: {
  onAddBooking: (booking: Booking) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1); // Wizard step
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
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

  useEffect(() => {
    setServicesLoading(true);
    fetchServices()
      .then((data) => setServices(data.filter((s) => s.status === "Active")))
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
  }, []);

  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const basePrice = selectedServicesList.reduce((sum, s) => sum + (s.pricingTiers[0]?.price ?? 0), 0);
  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()));

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

  // Time slots generator based on date
  const generateTimeSlots = (date: Date | null) => {
    if (!date) return [];
    const day = date.getDate();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const allSlots = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
      "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
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
  const dynamicBookedSlots = generateBookedSlots(selectedDate, dynamicTimeSlots);

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
    if (!selectedTime) {
      setSubmitError("Please select a time slot.");
      return;
    }

    const servicesPayload = selectedServicesList.map((service) => {
      const addons = service.addons.filter((a) => selectedAddons.includes(a.id));
      return {
        name: service.name,
        addons: addons.map((a) => a.name),
      };
    });

    const addonsCost = selectedServicesList.reduce((sum, service) => {
      const addons = service.addons.filter((a) => selectedAddons.includes(a.id));
      return sum + addons.reduce((s, a) => s + a.price, 0);
    }, 0);

    const amount = basePrice + addonsCost;

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
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  return (
    <div className="flex h-full flex-col w-full max-w-2xl mx-auto bg-white">
      <div className="border-primary/10 flex items-center justify-between border-b p-6 md:p-8 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                onCancel();
              }
            }}
            className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-primary-dark font-serif text-2xl">
            {step === 1 ? "Select Service" : step === 2 ? "Choose Date & Time" : "Client Details"}
          </h2>
        </div>
        <div className="text-sm font-medium text-text-secondary">
          Step {step} of 3
        </div>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto relative">
        <form
          id="add-booking-form"
          onSubmit={handleSubmit}
          className="space-y-8 p-6 md:p-8"
        >
          {/* STEP 1: Services */}
          {step === 1 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="sticky top-0 z-10 -mx-6 -mt-6 bg-white px-6 pb-4 pt-6 md:-mx-8 md:-mt-8 md:px-8 md:pt-8 border-b border-primary/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="text"
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-colors shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                {servicesLoading ? (
                  <div className="text-text-secondary flex items-center gap-2 px-4 py-3 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading services...
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
                                setSelectedServiceIds(selectedServiceIds.filter((id) => id !== s.id));
                                // Also clear any selected addons that belong to this service
                                const removedAddonIds = s.addons.map((a) => a.id);
                                setSelectedAddons((prev) =>
                                  prev.filter((id) => !removedAddonIds.includes(id))
                                );
                              } else {
                                setSelectedServiceIds([...selectedServiceIds, s.id]);
                              }
                            }}
                            className="flex items-center p-3 text-left w-full gap-3"
                          >
                            {s.image ? (
                              <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <span className="text-gray-400 text-[10px] uppercase font-semibold">No img</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-primary-dark font-medium block truncate text-sm">{s.name}</span>
                              <span className="text-primary text-sm font-medium">
                                QAR {s.pricingTiers[0]?.price ?? 0}
                              </span>
                            </div>
                          </button>

                          {isSelected && s.addons.length > 0 && (
                            <div className="px-3 pb-3 border-t border-primary/5 mt-1 pt-2 space-y-1">
                              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                                Add-ons
                              </p>
                              {s.addons.map((addon) => {
                                const isAddonSelected = selectedAddons.includes(addon.id);
                                return (
                                  <button
                                    type="button"
                                    key={addon.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddonToggle(addon.id);
                                    }}
                                    className={`flex w-full cursor-pointer items-center space-x-3 rounded-xl p-2.5 transition-colors ${
                                      isAddonSelected ? "bg-[#e8baa0]/10" : "hover:bg-black/5"
                                    }`}
                                  >
                                    <div
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                                        isAddonSelected
                                          ? "bg-[#e8baa0] text-white rotate-45 shadow-sm"
                                          : "bg-white border border-primary/20 text-primary hover:border-primary/50"
                                      }`}
                                    >
                                      <Plus className="h-4 w-4" strokeWidth={isAddonSelected ? 2.5 : 2} />
                                    </div>
                                    <div className="flex flex-1 justify-between text-xs">
                                      <span className={`truncate pr-2 font-medium ${isAddonSelected ? "text-[#e8baa0]" : "text-primary-dark"}`}>
                                        {addon.name}
                                      </span>
                                      <span className="text-text-secondary font-medium whitespace-nowrap">
                                        + QAR {addon.price}
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
                       <div className="text-text-secondary py-6 text-center text-sm border rounded-2xl bg-gray-50 border-dashed">
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
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                        dateObj.toDateString() === selectedDate.toDateString();
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
                          className={`flex h-8 w-full md:h-10 items-center justify-center rounded-full text-sm transition-all ${isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-[#e8baa0]/20"} ${isSelected ? "bg-[#e8baa0] text-white font-medium shadow-md" : ""} ${isToday && !isSelected ? "border-[#e8baa0]/50 text-[#e8baa0] border font-medium" : ""} ${!isPast && !isSelected && !isToday ? "text-text-primary" : ""} `}
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
                <div className="mb-4 mt-4 flex items-center justify-between">
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
                                ? "bg-[#e8baa0] border-[#e8baa0] text-white shadow-md"
                                : "bg-surface border-[#e8baa0]/30 text-text-primary hover:border-[#e8baa0] hover:shadow-sm"
                          } `}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-text-secondary py-6 text-center text-sm border rounded-2xl bg-gray-50 border-dashed">
                    Please select a date to see available times.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Client Details */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-primary-dark mb-1 block text-sm font-medium">
                    Customer Name
                  </label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:outline-none focus:bg-white shadow-sm"
                    placeholder="e.g. Sarah Smith"
                  />
                </div>
                <div>
                  <label className="text-primary-dark mb-1 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:outline-none focus:bg-white shadow-sm"
                    placeholder="+974 5555 0000"
                  />
                </div>
              </div>

              <div className="mt-8 border-t border-primary/10 pt-6">
                <h4 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
                  Booking Summary
                </h4>
                <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-primary/5 shadow-sm">
                  {selectedServicesList.map((service) => {
                    const serviceAddons = service.addons.filter(a => selectedAddons.includes(a.id));
                    return (
                      <div key={service.id} className="pb-3 border-b border-primary/10 last:border-0 last:pb-0">
                        <div className="flex justify-between font-medium text-primary-dark text-sm">
                          <span>{service.name}</span>
                          <span>QAR {service.pricingTiers[0]?.price || 0}</span>
                        </div>
                        {serviceAddons.map(addon => (
                          <div key={addon.id} className="flex justify-between text-xs text-text-secondary mt-1 pl-2">
                            <span>+ {addon.name}</span>
                            <span>QAR {addon.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="border-primary/10 flex items-center justify-between gap-4 border-t bg-white p-6 md:p-8 shrink-0">
        <div className="min-w-0">
          {submitError ? (
            <p className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 p-2 rounded-lg">
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
                      service.addons
                        .filter((a) => selectedAddons.includes(a.id))
                        .reduce((s, a) => s + a.price, 0)
                    );
                  }, 0)}
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && selectedServiceIds.length === 0) {
                  setSubmitError("Please select at least one service.");
                  return;
                }
                if (step === 2 && !selectedTime) {
                  setSubmitError("Please select a time slot.");
                  return;
                }
                setSubmitError(null);
                setStep(step + 1);
              }}
              className="bg-[#e8baa0] flex shrink-0 items-center space-x-2 rounded-full px-8 py-3 font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <span>Next Step</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              form="add-booking-form"
              type="submit"
              disabled={submitting}
              className="bg-[#e8baa0] flex shrink-0 items-center space-x-2 rounded-full px-8 py-3 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              <span>{submitting ? "Booking..." : "Confirm"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
