"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { fetchServices } from "../services/api";
import { Service } from "../services/mock-data";
import { createBooking, updateBooking } from "./api";
import { Booking } from "./mock-data";

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
  const [customerName, setCustomerName] = useState(initialData?.customerName ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
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
              return s ? bs.addons.map((aname) => s.addons.find((a) => a.name === aname)?.id) : [];
            })
            .filter(Boolean) as string[];
          setSelectedAddons(aIds);
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
    (sum, s) => sum + (s.pricingTiers[0]?.price ?? 0),
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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
      const addons = service.addons.filter((a) => selectedAddons.includes(a.id));
      return { name: service.name, addons: addons.map((a) => a.name) };
    });
    const addonsCost = selectedServicesList.reduce((sum, service) => {
      const addons = service.addons.filter((a) => selectedAddons.includes(a.id));
      return sum + addons.reduce((s, a) => s + a.price, 0);
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
      setSubmitError(err instanceof Error ? err.message : "Failed to save booking");
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
    <div className="flex h-full flex-col w-full bg-white">
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Side: Wizard Forms */}
        <div className="scrollbar-hide w-full md:w-[60%] overflow-y-auto relative shrink-0">
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8">
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
                                  setSelectedServiceIds(
                                    selectedServiceIds.filter((id) => id !== s.id)
                                  );
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
                                <span className="text-primary text-sm font-medium">QAR {s.pricingTiers[0]?.price ?? 0}</span>
                              </div>
                            </button>
                            {isSelected && s.addons.length > 0 && (
                              <div className="px-3 pb-3 border-t border-primary/5 mt-1 pt-2 space-y-1">
                                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Add-ons</p>
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
                                        <span className={`truncate pr-2 font-medium ${isAddonSelected ? "text-[#e8baa0]" : "text-primary-dark"}`}> {addon.name}</span>
                                        <span className="text-text-secondary font-medium whitespace-nowrap">+ QAR {addon.price}</span>
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
                        <div key={day} className="text-text-secondary py-1 text-center text-xs font-medium">
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
                        const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
                        const isToday = dateObj.toDateString() === today.toDateString();
                        return (
                          <button
                            type="button"
                            key={d}
                            disabled={isPast}
                            onClick={() => {
                              setSelectedDate(dateObj);
                              setSelectedTime(null);
                            }}
                            className={`flex h-8 w-full md:h-10 items-center justify-center rounded-full text-sm transition-all ${
                              isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-[#e8baa0]/20"
                            } ${
                              isSelected ? "bg-[#e8baa0] text-white font-medium shadow-md" : ""
                            } ${
                              isToday && !isSelected ? "border-[#e8baa0]/50 text-[#e8baa0] border font-medium" : ""
                            } ${
                              !isPast && !isSelected && !isToday ? "text-text-primary" : ""
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
                  <div className="mb-4 mt-4 flex items-center justify-between">
                    <h3 className="text-primary-dark font-serif text-lg">Available Times</h3>
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
            {/* STEP 3: Customer Details */}
            {step === 3 && (
              <div className="flex flex-col justify-center min-h-[300px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mx-auto w-full max-w-sm space-y-5">
                  <div>
                    <label className="text-primary-dark mb-1.5 block text-sm font-medium">Customer Name</label>
                    <input
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[0-9]/g, "");
                        setCustomerName(val);
                      }}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:outline-none focus:bg-white shadow-sm"
                      placeholder="e.g. Sarah Smith"
                    />
                  </div>
                  <div>
                    <label className="text-primary-dark mb-1.5 block text-sm font-medium">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[a-zA-Z]/g, "");
                        setPhone(val);
                      }}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:outline-none focus:bg-white shadow-sm"
                      placeholder="+974 5555 0000"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        {/* Right Side: Summary & Actions */}
        <div className="border-primary/10 bg-gray-50 flex w-full md:w-[40%] flex-col border-t md:border-t-0 md:border-l shrink-0">
          <div className="flex flex-1 flex-col p-6 space-y-6 min-h-0">
            <h4 className="text-primary-dark font-serif text-lg shrink-0">Summary</h4>
            {selectedTime && selectedDate && (
              <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm shrink-0">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1">Date & Time</p>
                <p className="text-sm font-medium text-primary-dark">{selectedDate.toDateString()} at {selectedTime}</p>
              </div>
            )}
            {selectedServicesList.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0 space-y-3">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold shrink-0">Services</p>
                <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm flex-1 overflow-y-auto scrollbar-hide space-y-3">
                  {selectedServicesList.map((service) => {
                    const serviceAddons = service.addons.filter((a) => selectedAddons.includes(a.id));
                    return (
                      <div key={service.id} className="pb-3 border-b border-primary/10 last:border-0 last:pb-0">
                        <div className="flex justify-between font-medium text-primary-dark text-sm">
                          <span>{service.name}</span>
                          <span>QAR {service.pricingTiers[0]?.price || 0}</span>
                        </div>
                        {serviceAddons.map((addon) => (
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
            ) : (
              <div className="text-sm text-text-secondary shrink-0">No services selected yet.</div>
            )}
          </div>
          <div className="bg-white p-6 border-t border-primary/10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="mb-4">
              {submitError ? (
                <p className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                </p>
              ) : (
                <>
                  <p className="text-text-secondary text-sm">Total Estimated Amount</p>
                  <p className="text-primary-dark font-serif text-2xl">
                    QAR {" "}
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
            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 1 && selectedServiceIds.length === 0) || (step === 2 && !selectedTime)}
                onClick={() => {
                  setSubmitError(null);
                  setStep(step + 1);
                }}
                className="bg-[#e8baa0] w-full justify-center flex items-center space-x-2 rounded-full px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next Step</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                form="booking-form"
                type="submit"
                disabled={submitting || customerName.trim().length < 4 || phone.trim().length < 8}
                className="bg-[#e8baa0] w-full justify-center flex items-center space-x-2 rounded-full px-8 py-3.5 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
