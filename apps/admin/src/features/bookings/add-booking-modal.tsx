"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Calendar, Clock, Loader2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

import { fetchServices } from "../services/api";
import { Service } from "../services/mock-data";
import { createBooking } from "./api";
import { Booking } from "./mock-data";

export function AddBookingModal({
  isOpen,
  onClose,
  onAddBooking,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddBooking: (booking: Booking) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
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
    if (!isOpen || services.length > 0) return;
    setServicesLoading(true);
    fetchServices()
      .then((data) => setServices(data.filter((s) => s.status === "Active")))
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
  }, [isOpen, services.length]);

  if (!isOpen) return null;

  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const basePrice = selectedServicesList.reduce((sum, s) => sum + (s.pricingTiers[0]?.price ?? 0), 0);

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
      onClose();

      // Reset
      setCustomerName("");
      setPhone("");
      setSelectedServiceIds([]);
      setSelectedAddons([]);
      setSelectedDate(new Date());
      setSelectedTime(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="bg-primary-dark/40 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] bg-[#faf6f3] shadow-xl">
        <div className="border-primary/10 flex items-center justify-between border-b p-6 md:p-8">
          <h2 className="text-primary-dark font-serif text-2xl">
            New Walk-in Booking
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-6 md:p-8">
          <form
            id="add-booking-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                Client Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-primary-dark mb-1 block text-sm font-medium">
                    Customer Name
                  </label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:bg-white focus:outline-none"
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
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:bg-white focus:outline-none"
                    placeholder="+974 5555 0000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                Service Selection
              </h3>
              {servicesLoading ? (
                <div className="text-text-secondary flex items-center gap-2 px-4 py-3 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading services...
                </div>
              ) : servicesError ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" /> {servicesError}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {services.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
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
                        className={`flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#e8baa0] bg-[#e8baa0]/10 shadow-sm"
                            : "border-primary/10 bg-white hover:border-[#e8baa0]/30"
                        }`}
                      >
                        <span className="text-primary-dark font-medium">{s.name}</span>
                        <span className="text-primary mt-1 text-sm font-medium">
                          QAR {s.pricingTiers[0]?.price ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedServicesList.length > 0 && selectedServicesList.some((s) => s.addons.length > 0) && (
                <div className="mt-4">
                  <label className="text-primary-dark mb-2 block text-sm font-medium">
                    Enhance with Add-ons
                  </label>
                  <div className="space-y-4">
                    {selectedServicesList.map((service) => {
                      if (service.addons.length === 0) return null;
                      return (
                        <div key={service.id} className="space-y-2">
                          <p className="text-xs font-semibold text-text-secondary uppercase">
                            {service.name} Add-ons
                          </p>
                          {service.addons.map((addon) => (
                            <label
                              key={addon.id}
                              className="border-primary/10 flex cursor-pointer items-center space-x-3 rounded-xl border p-3 transition-colors hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAddons.includes(addon.id)}
                                onChange={() => handleAddonToggle(addon.id)}
                                className="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
                              />
                              <div className="flex flex-1 justify-between">
                                <span className="text-primary-dark font-medium">{addon.name}</span>
                                <span className="text-text-secondary">+ QAR {addon.price}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                Date & Time
              </h3>
              
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
                          className={`rounded-soft border py-2 text-sm font-medium transition-colors ${
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
          </form>
        </div>

        <div className="border-primary/10 flex items-center justify-between gap-4 border-t bg-gray-50 p-6 md:p-8">
          <div className="min-w-0">
            {submitError ? (
              <p className="flex items-center gap-1.5 text-sm text-red-500">
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
            <span>{submitting ? "Booking..." : "Confirm Booking"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
