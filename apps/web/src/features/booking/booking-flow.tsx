"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookingStore, useCartStore, useUserStore } from "@/shared/store";
import { CartItem, Item, ItemVariant } from "@/shared/types";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  X,
} from "lucide-react";

function CartItemCard({
  cartItem,
  setItemToDelete,
  removeItem,
  addItem,
}: {
  cartItem: CartItem;
  setItemToDelete: (id: string) => void;
  removeItem: (id: string) => void;
  addItem: (item: Item, variant?: ItemVariant, addons?: ItemVariant[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-soft border-primary/5 overflow-hidden border shadow-sm">
      <div
        className="hover:bg-primary/5 flex cursor-pointer items-center justify-between p-4 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={cartItem.item.imageUrl}
              alt={cartItem.item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-text-primary text-[15px] font-medium">
              {cartItem.item.name}
            </h4>
            <span className="text-primary mt-1 block font-semibold">
              QAR {cartItem.totalPrice}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`text-text-secondary transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-primary/5 border-t bg-gray-50/50 px-4 pt-3 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-text-secondary text-xs font-medium uppercase">
                Details
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setItemToDelete(cartItem.id);
                }}
                className="text-text-secondary hover:text-primary text-xs font-medium transition-colors"
              >
                Remove Service
              </button>
            </div>
            {cartItem.selectedVariant && (
              <div className="mb-2">
                <p className="text-text-secondary mb-1 text-xs font-medium uppercase">
                  Duration / Variant:
                </p>
                <p className="text-text-primary text-sm">
                  {cartItem.selectedVariant.name}
                </p>
              </div>
            )}

            {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-text-secondary mb-1 text-xs font-medium uppercase">
                  Add-ons:
                </p>
                {cartItem.selectedAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className="text-text-secondary flex items-center justify-between rounded border border-gray-100 bg-white p-2 text-sm"
                  >
                    <span>+ {addon.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">QAR {addon.price}</span>
                      <button
                        onClick={() => {
                          const newAddons = cartItem.selectedAddons?.filter(
                            (a) => a.id !== addon.id
                          );
                          removeItem(cartItem.id);
                          addItem(
                            cartItem.item,
                            cartItem.selectedVariant,
                            newAddons
                          );
                        }}
                        className="text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Link
                href={`/service/${cartItem.item.id}`}
                className="text-primary flex items-center text-xs font-medium hover:underline"
              >
                <Plus className="mr-1 h-3 w-3" /> Add more addons
              </Link>
            </div>

            {!cartItem.selectedVariant &&
              (!cartItem.selectedAddons ||
                cartItem.selectedAddons.length === 0) && (
                <p className="text-text-secondary mt-3 text-sm italic">
                  No additional options selected.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingFlow({
  isIntegrated = false,
}: {
  isIntegrated?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"services" | "time" | "auth" | "success">(
    "services"
  );
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Stores
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const addBooking = useBookingStore((state) => state.addBooking);

  // Time slot matrix state
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // OTP Auth state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");

  const [isMounted, setIsMounted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    if (isWeekend) {
      return allSlots.filter((_, i) => i % 2 === 0);
    } else if (day % 3 === 0) {
      return allSlots.slice(0, 10);
    } else if (day % 3 === 1) {
      return allSlots.slice(10, 20);
    } else {
      return allSlots;
    }
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
    if (!match || !match[1] || !match[2] || !match[3]) return timeLabel;
    let hours = Number(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const persistBookingToSanity = async (
    customerName: string,
    customerPhone: string
  ) => {
    const servicesPayload = cartItems.map((ci) => ({
      name: ci.item.name,
      addons: (ci.selectedAddons ?? []).map((a) => a.name),
    }));

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone: customerPhone,
        services: servicesPayload,
        date: toIsoDate(selectedDate),
        time: to24Hour(selectedTime || "10:00 AM"),
        amount: total,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to create booking");
    }

    return res.json() as Promise<{ id: string }>;
  };

  const completeLocalBooking = (createdId: string) => {
    addBooking({
      id: createdId,
      cartItems,
      totalPrice: total,
      date:
        selectedDate?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      time: selectedTime || "",
      status: "upcoming",
      bookingRef: `#ORYX-${createdId.slice(-5).toUpperCase()}`,
    });
    setStep("success");
    clearCart();
  };

  const handleCheckout = async () => {
    if (!user) {
      setStep("auth");
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);
    try {
      const created = await persistBookingToSanity(user.name, user.phone);
      completeLocalBooking(created.id);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setBookingSubmitting(true);
    setBookingError(null);
    try {
      setUser({ id: "u1", name, phone, channel });
      const created = await persistBookingToSanity(name, phone);
      completeLocalBooking(created.id);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === "success") {
      router.back();
    } else if (step === "auth") {
      setStep("time");
    } else if (step === "time") {
      setStep("services");
    } else {
      router.back();
    }
  };

  if (!isMounted)
    return <div className="flex-1 bg-white md:bg-transparent" />;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white md:flex-row md:bg-transparent">
      {/* LEFT COLUMN - MAIN FLOW */}
      <div
        className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden ${step !== "success" ? "md:border-primary/10 md:border-r" : ""}`}
      >
        {step !== "success" && (
          <>
            {(!isIntegrated || step !== "services") && (
              <div
                className={`absolute top-0 right-0 left-0 z-40 flex w-full items-center justify-center px-6 pt-6 pb-4 ${step === "auth" ? "bg-white" : "bg-[#e8baa0] md:bg-white"}`}
              >
                <button
                  onClick={handleBack}
                  className={`absolute left-6 flex items-center justify-center rounded-full p-2 transition-colors ${step === "auth" ? "md:text-text-secondary text-white hover:bg-white/20 md:hover:bg-black/5" : "text-text-secondary hover:bg-black/5"}`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h1
                  className={`text-center font-serif text-3xl font-medium ${step === "auth" ? "md:text-primary-dark text-white" : "text-primary-dark"}`}
                >
                  Book Session
                </h1>
              </div>
            )}
            {/* Spacer to push content below fixed header */}
            {(!isIntegrated || step !== "services") && (
              <div className="h-[76px] w-full shrink-0 md:bg-white" />
            )}
          </>
        )}

        {/* 1. CART SUMMARY */}
        {step === "services" && (
          <div
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-32 md:bg-white md:pb-8"
            data-lenis-prevent
          >
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-6 px-6 pt-20 text-center">
                <ClipboardList className="text-primary/20 h-16 w-16" />
                <div>
                  <h3 className="text-primary-dark mb-2 font-serif text-2xl">
                    Your booking is empty
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Explore our services and add them to your booking.
                  </p>
                </div>
                <Link
                  href="/services"
                  className="bg-primary text-surface rounded-full px-8 py-3 font-medium"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="flex min-h-full flex-col">
                {/* Tabs */}
                <div className="mb-6 px-6">
                  <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2">
                    {Array.from(
                      new Set(cartItems.map((i) => i.item.category))
                    ).map((category, idx, arr) => {
                      return null;
                    })}
                  </div>

                  {/* Grouped Items */}
                  <div className="space-y-6">
                    {Array.from(
                      new Set(cartItems.map((i) => i.item.category))
                    ).map((category) => (
                      <div key={category} className="space-y-3">
                        <h3 className="text-white border-white/20 border-b pb-2 text-lg font-medium">
                          {category}
                        </h3>
                        {cartItems
                          .filter((i) => i.item.category === category)
                          .map((cartItem) => (
                            <CartItemCard
                              key={cartItem.id}
                              cartItem={cartItem}
                              setItemToDelete={setItemToDelete}
                              removeItem={removeItem}
                              addItem={addItem}
                            />
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add more & Billing (Mobile Billing hidden on Desktop) */}
                <div className="mt-auto space-y-6 px-6 pt-4 pb-8">
                  <Link
                    href="/services"
                    className="border-primary/20 text-primary hover:bg-primary/5 flex w-full items-center justify-center rounded-xl border-2 bg-transparent py-3.5 font-medium transition-colors"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add More Services
                  </Link>

                  <div className="bg-primary/5 rounded-soft space-y-3 p-5 md:hidden">
                    <h3 className="text-primary-dark mb-4 font-serif text-lg">
                      Billing Details
                    </h3>
                    <div className="text-text-secondary flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>QAR {total}</span>
                    </div>
                    <div className="text-text-secondary flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>QAR 0.00</span>
                    </div>
                    <div className="text-text-primary border-primary/10 flex justify-between border-t pt-3 text-lg font-medium">
                      <span>Total</span>
                      <span>QAR {total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. TIME SELECTION */}
        {step === "time" && (
          <div
            className="scrollbar-hide min-h-0 flex-1 space-y-8 overflow-y-auto px-6 pt-4 pb-32 md:bg-white md:pb-8"
            data-lenis-prevent
          >
            {/* Calendar Header */}
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
                    onClick={handlePrevMonth}
                    disabled={isCurrentMonth}
                    className="border-primary/10 text-primary hover:bg-primary/5 rounded-full border bg-white p-2 shadow-sm transition-all disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
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
                    <div key={`blank-${b}`} className="h-10"></div>
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
                        key={d}
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDate(dateObj);
                          setSelectedTime(null);
                        }}
                        className={`flex h-10 w-full items-center justify-center rounded-full text-sm transition-all ${isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-primary/10"} ${isSelected ? "bg-primary text-surface hover:bg-primary font-medium shadow-md" : ""} ${isToday && !isSelected ? "border-primary/30 text-primary border font-medium" : ""} ${!isPast && !isSelected && !isToday ? "text-text-primary" : ""} `}
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
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
                  {dynamicTimeSlots.map((time) => {
                    const isBooked = dynamicBookedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-soft border py-2.5 text-sm font-medium transition-colors ${
                          isBooked
                            ? "border-transparent bg-gray-100 text-gray-400 opacity-40"
                            : isSelected
                              ? "bg-primary border-primary text-surface shadow-md"
                              : "bg-surface border-primary/20 text-text-primary hover:border-primary hover:shadow-sm"
                        } `}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-text-secondary py-8 text-center text-sm">
                  Please select a date to see available times.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. AUTH / OTP */}
        {step === "auth" && (
          <div
            className="scrollbar-hide flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-[#fbf6f0] py-12 md:bg-white md:py-0"
            data-lenis-prevent
          >
            {/* Top Pink Banner (Mobile only) */}
            

            <div className="md:border-primary/10 relative z-10 w-[calc(100%-2.5rem)] max-w-[420px] rounded-[2.5rem] bg-white p-8 pb-10 shadow-xl md:border">
              {/* Heading */}
              <h3 className="text-primary-dark mt-2 mb-6 text-center font-serif text-2xl">
                Your Details
              </h3>

              <form
                id="auth-form"
                onSubmit={handleAuthSubmit}
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="focus:ring-primary/50 text-text-primary w-full rounded-xl border border-[#c8a24a] bg-transparent px-4 py-3 text-sm placeholder:text-gray-300 focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+974 1234 5678"
                    className="focus:ring-primary/50 text-text-primary w-full rounded-xl border border-[#c8a24a] bg-transparent px-4 py-3 text-sm placeholder:text-gray-300 focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* Receive Updates Via */}
                <div className="pt-2">
                  <label className="mb-3 block text-center text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                    Receive Updates Via
                  </label>
                  <div className="flex rounded-xl border border-[#c8a24a] bg-transparent p-1">
                    <button
                      type="button"
                      onClick={() => setChannel("WhatsApp")}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${channel === "WhatsApp" ? "bg-[#c8a24a] text-white shadow-sm" : "text-[#9a8276] hover:bg-[#fbf6f0]"}`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("SMS")}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${channel === "SMS" ? "bg-[#c8a24a] text-white shadow-sm" : "text-[#9a8276] hover:bg-[#fbf6f0]"}`}
                    >
                      SMS
                    </button>
                  </div>
                </div>

                {/* Verify & Confirm (Mobile Only) */}
                <div className="pt-6 md:hidden">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#c8a24a] py-3.5 font-medium text-white shadow-md transition-all hover:opacity-90"
                  >
                    Verify & Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. SUCCESS */}
        {step === "success" && (
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center space-y-4 bg-white px-6 text-center md:bg-white">
            <CheckCircle2 className="text-primary h-24 w-24" />
            <h2 className="text-primary-dark mt-4 font-serif text-3xl md:text-4xl">
              Booking Confirmed!
            </h2>
            <p className="text-text-secondary mx-auto max-w-md">
              Your appointment has been successfully scheduled. We have sent the
              details via {channel}.
            </p>
            <Link
              href="/"
              className="bg-[#c8a24a] text-white hover:opacity-90 mt-8 inline-block rounded-xl px-8 py-3.5 font-medium shadow-md transition-all"
            >
              Return to Home
            </Link>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN - PERSISTENT DESKTOP ORDER SUMMARY */}
      {step !== "success" && (
        <div
          className="scrollbar-hide relative hidden w-[380px] flex-col overflow-y-auto bg-gray-50/50 p-8 md:flex lg:w-[420px]"
          data-lenis-prevent
        >
          <div className="sticky top-0 space-y-8">
            <div>
              <h3 className="text-primary-dark border-primary/10 mb-6 border-b pb-4 font-serif text-2xl">
                Order Summary
              </h3>

              <div
                className="scrollbar-hide max-h-[300px] space-y-4 overflow-y-auto pr-2"
                data-lenis-prevent
              >
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-text-primary leading-tight font-medium">
                        {item.item.name}
                      </span>
                      {item.selectedVariant && (
                        <span className="text-text-secondary mt-1 text-xs">
                          {item.selectedVariant.name}
                        </span>
                      )}
                    </div>
                    <span className="text-primary shrink-0 font-semibold">
                      QAR {item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-primary/5 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
              <h4 className="text-primary-dark mb-2 font-serif text-lg">
                Billing Details
              </h4>
              <div className="text-text-secondary flex justify-between text-sm">
                <span>Subtotal</span>
                <span>QAR {total}</span>
              </div>
              <div className="text-text-secondary flex justify-between text-sm">
                <span>Taxes & Fees</span>
                <span>QAR 0.00</span>
              </div>
              <div className="text-text-primary border-primary/10 flex justify-between border-t pt-4 text-lg font-medium">
                <span>Total</span>
                <span className="text-primary-dark font-bold">QAR {total}</span>
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="pt-2">
              {step === "services" ? (
                <button
                  onClick={() => setStep("time")}
                  disabled={cartItems.length === 0}
                  className="bg-[#c8a24a] hover:opacity-90 flex w-full items-center justify-center rounded-xl py-4 text-lg font-medium text-white shadow-md transition-all disabled:opacity-50"
                >
                  Proceed to Time <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              ) : step === "time" ? (
                <>
                  {bookingError && (
                    <p className="mb-3 text-center text-sm text-red-500">
                      {bookingError}
                    </p>
                  )}
                  <button
                    disabled={!selectedTime || bookingSubmitting}
                    onClick={handleCheckout}
                    className="bg-[#c8a24a] hover:opacity-90 flex w-full items-center justify-center rounded-xl py-4 text-lg font-medium text-white shadow-md transition-all disabled:opacity-50"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Booking...
                      </>
                    ) : (
                      <>
                        Checkout <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </>
              ) : step === "auth" ? (
                <>
                  {bookingError && (
                    <p className="mb-3 text-center text-sm text-red-500">
                      {bookingError}
                    </p>
                  )}
                  <button
                    type="submit"
                    form="auth-form"
                    disabled={bookingSubmitting}
                    className="flex w-full items-center justify-center rounded-xl bg-[#c8a24a] py-4 text-lg font-medium text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Confirming...
                      </>
                    ) : (
                      <>
                        Verify & Confirm{" "}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* CART FLOATING ACTION (Mobile Only) */}
      {cartItems.length > 0 && (step === "services" || step === "time") && (
        <div className="animate-in slide-in-from-bottom-5 absolute right-0 bottom-[100px] left-0 z-40 mx-auto w-full max-w-md px-6 md:hidden">
          <div className="bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] text-gray-900 flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="flex items-center text-sm font-medium">
                <ClipboardList className="mr-2 h-4 w-4" /> {cartItems.length}{" "}
                items
              </span>
              <span className="font-serif text-xl font-bold">QAR {total}</span>
            </div>
            {step === "services" ? (
              <button
                onClick={() => setStep("time")}
                className="bg-[#c8a24a] text-white hover:opacity-90 border-surface/20 flex items-center rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Book the services <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            ) : (
              <button
                disabled={!selectedTime || bookingSubmitting}
                onClick={handleCheckout}
                className="bg-[#c8a24a] text-white hover:opacity-90 border-surface/20 flex items-center rounded-full border px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {bookingSubmitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    Checkout <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div className="bg-surface shadow-spa animate-in zoom-in-95 w-full max-w-sm rounded-2xl p-6">
            <h3 className="text-primary-dark mb-2 font-serif text-xl">
              Remove Service
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              Are you sure you want to remove this service from your booking?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="border-primary/20 text-text-primary flex-1 rounded-full border py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (itemToDelete) {
                    removeItem(itemToDelete);
                  }
                  setItemToDelete(null);
                }}
                className="bg-primary text-surface flex-1 rounded-full py-2.5 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
