"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PHONE_COUNTRY,
  validateName,
  validatePhoneValue,
  type CountryCode,
} from "@/shared/lib/phone";
import { Item, ItemVariant } from "@/shared/types";
import { PhoneInput } from "@/shared/ui/phone-input";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";

type Step = "time" | "details" | "success";

interface ServiceBookingWizardProps {
  item: Item;
  selectedOptions: ItemVariant[];
  total: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

const ALL_TIME_SLOTS = [
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

function generateTimeSlots(date: Date | null) {
  if (!date) return [];
  return ALL_TIME_SLOTS;
}

function toIsoDate(date: Date | null) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function to24Hour(timeLabel: string) {
  if (!timeLabel) return "10:00";
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match?.[1] || !match[2] || !match[3]) return timeLabel;
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function ServiceBookingWizard({
  item,
  selectedOptions,
  total,
  open,
  onClose,
  onSuccess,
}: ServiceBookingWizardProps) {
  const [step, setStep] = useState<Step>("time");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(
    DEFAULT_PHONE_COUNTRY
  );
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState("");

  const handlePhoneCountryChange = useCallback(
    (country: CountryCode) => {
      setPhoneCountry(country);
      setTouched((t) => (phone.trim() ? { ...t, phone: true } : t));
    },
    [phone]
  );

  useEffect(() => {
    if (!open) {
      setStep("time");
      setSelectedDate(new Date());
      setCurrentMonth(new Date());
      setSelectedTime(null);
      setName("");
      setPhone("");
      setPhoneCountry(DEFAULT_PHONE_COUNTRY);
      setNameError("");
      setPhoneError("");
      setTouched({ name: false, phone: false });
      setBookingError(null);
      setBookingSubmitting(false);
      setBookingRef("");
    }
  }, [open]);

  useEffect(() => {
    if (touched.name) setNameError(validateName(name));
  }, [name, touched.name]);

  useEffect(() => {
    if (touched.phone) {
      setPhoneError(
        validatePhoneValue(phone, {
          label: "WhatsApp number",
          country: phoneCountry,
        })
      );
    }
  }, [phone, phoneCountry, touched.phone]);

  if (!open) return null;

  const today = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const dynamicTimeSlots = generateTimeSlots(selectedDate);

  const isDetailsValid =
    validateName(name) === "" &&
    validatePhoneValue(phone, {
      label: "WhatsApp number",
      country: phoneCountry,
    }) === "";

  const handleBack = () => {
    if (step === "success") {
      onSuccess();
      onClose();
    } else if (step === "details") {
      setStep("time");
    } else {
      onClose();
    }
  };

  const handleTimeContinue = () => {
    if (!selectedTime) return;
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextNameError = validateName(name);
    const nextPhoneError = validatePhoneValue(phone, {
      label: "WhatsApp number",
      country: phoneCountry,
    });
    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    setTouched({ name: true, phone: true });
    if (nextNameError || nextPhoneError) return;

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          services: [
            {
              name: item.name,
              options: selectedOptions.map((o) => o.name),
            },
          ],
          date: toIsoDate(selectedDate),
          time: to24Hour(selectedTime || "10:00 AM"),
          amount: total,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create booking");
      }

      const created = (await res.json()) as {
        id: string;
        bookingCode?: string;
      };
      setBookingRef(created.bookingCode ?? created.id);
      setStep("success");
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const stepLabel =
    step === "time"
      ? "Step 1 of 2 · Choose date & time"
      : step === "details"
        ? "Step 2 of 2 · Your details"
        : "";

  return (
    <div className="bg-surface fixed inset-0 z-50 flex flex-col lg:items-center lg:justify-center lg:bg-black/45 lg:p-8">
      <div className="bg-surface flex h-full w-full flex-col overflow-hidden lg:h-auto lg:max-h-[92vh] lg:max-w-4xl lg:rounded-[2rem] lg:shadow-2xl xl:max-w-5xl">
        {step !== "success" && (
          <div className="border-primary/10 shrink-0 border-b bg-white px-6 pt-6 pb-4 lg:px-10 lg:pt-8 lg:pb-5">
            <div className="relative flex items-center justify-center">
              <button
                onClick={handleBack}
                className="text-text-secondary absolute left-0 flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 lg:p-2.5"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="text-center">
                <h1 className="text-primary-dark font-serif text-2xl font-medium lg:text-3xl">
                  Book Appointment
                </h1>
                <p className="text-text-secondary mt-1 text-xs lg:text-sm">
                  {stepLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "time" && (
          <div
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-32 lg:px-10 lg:pt-8 lg:pb-28"
            data-lenis-prevent
          >
            <div className="lg:grid lg:grid-cols-5 lg:items-start lg:gap-10">
              <div className="border-primary/10 mb-6 rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-0 lg:col-span-2 lg:mb-0 lg:rounded-3xl lg:p-6">
                <p className="text-text-secondary mb-1 text-xs font-medium tracking-wider uppercase">
                  Service
                </p>
                <p className="text-primary-dark font-medium">{item.name}</p>
                {selectedOptions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="text-text-secondary flex justify-between text-sm"
                      >
                        <span>{opt.name}</span>
                        <span className="font-medium">QAR {opt.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-primary/10 mt-3 flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span className="text-primary">QAR {total}</span>
                </div>
              </div>

              <div className="lg:col-span-3 lg:space-y-8">
                <div className="border-primary/10 mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm lg:mb-0">
                  <div className="border-primary/10 bg-primary/5 flex items-center justify-between border-b p-5">
                    <h3 className="text-primary-dark font-serif text-lg font-semibold capitalize">
                      {currentMonth.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() - 1,
                              1
                            )
                          )
                        }
                        disabled={isCurrentMonth}
                        className="border-primary/10 text-primary hover:bg-primary/5 rounded-full border bg-white p-2 shadow-sm transition-all disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() + 1,
                              1
                            )
                          )
                        }
                        className="border-primary/10 text-primary hover:bg-primary/5 rounded-full border bg-white p-2 shadow-sm transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6">
                    <div className="mb-2 grid grid-cols-7 gap-1 lg:gap-1.5">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-text-secondary py-1 text-center text-xs font-medium"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
                      {blanks.map((b) => (
                        <div key={`blank-${b}`} className="h-10 lg:h-12" />
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

                        let dayClass =
                          "flex h-10 w-full items-center justify-center rounded-full text-sm transition-all lg:h-12 lg:text-base ";
                        if (isPast) {
                          dayClass += "cursor-not-allowed text-gray-300";
                        } else if (isSelected) {
                          dayClass +=
                            "bg-primary text-white font-medium shadow-md hover:bg-primary-dark hover:text-white";
                        } else if (isToday) {
                          dayClass +=
                            "border border-primary text-primary font-medium hover:bg-primary/20 hover:text-primary-dark hover:border-primary";
                        } else {
                          dayClass +=
                            "text-text-primary hover:bg-primary/20 hover:text-primary-dark";
                        }

                        return (
                          <button
                            key={d}
                            disabled={isPast}
                            onClick={() => {
                              setSelectedDate(dateObj);
                              setSelectedTime(null);
                            }}
                            className={dayClass}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-primary-dark font-serif text-lg">
                      Available Times
                    </h3>
                    {selectedDate && (
                      <span className="text-text-secondary flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        {selectedDate.toLocaleString("default", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {dynamicTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-3 xl:grid-cols-5">
                      {dynamicTimeSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors lg:py-3 lg:text-base ${isSelected ? "bg-primary border-primary hover:bg-primary-dark text-white shadow-md hover:text-white" : "border-primary/20 text-text-primary hover:border-primary hover:bg-primary/20 hover:text-primary-dark bg-white"}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-text-secondary py-8 text-center text-sm lg:text-base">
                      Please select a date to see available times.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "details" && (
          <div
            className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6 pb-32 lg:px-10 lg:pt-8 lg:pb-28"
            data-lenis-prevent
          >
            <div className="lg:mx-auto lg:w-full lg:max-w-2xl">
              <div className="border-primary/10 mb-6 rounded-2xl border bg-white p-4 shadow-sm lg:rounded-3xl lg:p-6">
                <p className="text-text-secondary text-sm">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {selectedTime}
                </p>
                <p className="text-primary-dark mt-1 font-medium">
                  {item.name}
                </p>
                <p className="text-primary mt-2 font-semibold">QAR {total}</p>
              </div>

              <div className="border-primary/10 rounded-3xl border bg-white p-8 shadow-sm lg:p-10">
                <h3 className="text-primary-dark mb-6 text-center font-serif text-2xl lg:mb-8 lg:text-3xl">
                  Your Details
                </h3>

                <form
                  id="booking-details-form"
                  onSubmit={handleSubmit}
                  className="space-y-5 lg:space-y-6"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#9a8276] uppercase lg:mb-2 lg:text-sm">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="Enter full name"
                      className={`focus:ring-primary/50 text-text-primary w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-gray-300 focus:ring-1 focus:outline-none lg:px-5 lg:py-4 lg:text-base ${nameError ? "border-red-400" : "border-primary"}`}
                    />
                    {nameError && (
                      <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#9a8276] uppercase lg:mb-2 lg:text-sm">
                      WhatsApp Number
                    </label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      onCountryChange={handlePhoneCountryChange}
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                      hasError={Boolean(phoneError)}
                      placeholder="WhatsApp number"
                      className="lg:[&_button]:py-4 lg:[&_input]:py-4 lg:[&_input]:text-base"
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {bookingError && (
                    <p className="text-center text-sm text-red-500">
                      {bookingError}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center lg:px-12 lg:py-14">
            <CheckCircle2 className="text-primary h-20 w-20 lg:h-24 lg:w-24" />
            <h2 className="text-primary-dark mt-6 font-serif text-3xl lg:text-4xl">
              Booking Confirmed!
            </h2>
            {bookingRef && (
              <>
                <p className="text-text-secondary mt-4 text-sm">Booking ID</p>
                <p className="text-primary font-medium tracking-wide uppercase">
                  {bookingRef}
                </p>
              </>
            )}
            <p className="text-text-secondary mx-auto mt-4 max-w-sm">
              Your appointment has been scheduled. We will contact you shortly
              on WhatsApp.
            </p>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="bg-primary mt-8 rounded-xl px-8 py-3.5 font-medium text-white shadow-md transition-all hover:opacity-90"
            >
              Done
            </button>
            <Link
              href="/"
              className="text-primary mt-4 text-sm font-medium hover:underline"
            >
              Return to Home
            </Link>
          </div>
        )}

        {step === "time" && (
          <div
            className="border-primary/10 shrink-0 border-t bg-white px-6 py-4 lg:px-10 lg:py-5"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              disabled={!selectedTime}
              onClick={handleTimeContinue}
              className="bg-primary mx-auto flex w-full max-w-none items-center justify-center rounded-xl py-3.5 font-medium text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 lg:max-w-md lg:py-4 lg:text-base"
            >
              Continue
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>
        )}

        {step === "details" && (
          <div
            className="border-primary/10 shrink-0 border-t bg-white px-6 py-4 lg:px-10 lg:py-5"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="submit"
              form="booking-details-form"
              disabled={bookingSubmitting || !isDetailsValid}
              className="bg-primary mx-auto flex w-full items-center justify-center rounded-xl py-3.5 font-medium text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 lg:max-w-md lg:py-4 lg:text-base"
            >
              {bookingSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ChevronRight className="ml-1 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
