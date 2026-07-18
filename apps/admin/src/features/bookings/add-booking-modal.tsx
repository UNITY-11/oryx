"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Calendar, Clock, Loader2, Plus, X } from "lucide-react";

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
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const basePrice = selectedService?.pricingTiers[0]?.price ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const addons = selectedService.addons.filter((a) =>
      selectedAddons.includes(a.id)
    );
    const amount = basePrice + addons.reduce((sum, a) => sum + a.price, 0);

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createBooking({
        customerName,
        phone,
        services: [
          { name: selectedService.name, addons: addons.map((a) => a.name) },
        ],
        date: date || new Date().toISOString().split("T")[0],
        time: time || "10:00",
        status: "Confirmed",
        amount,
      });

      onAddBooking(created);
      onClose();

      // Reset
      setCustomerName("");
      setPhone("");
      setSelectedServiceId("");
      setSelectedAddons([]);
      setDate("");
      setTime("");
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
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] bg-white shadow-xl">
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
            className="space-y-6"
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
              <div>
                <label className="text-primary-dark mb-1 block text-sm font-medium">
                  Primary Service
                </label>
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
                  <select
                    required
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      setSelectedAddons([]);
                    }}
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 transition-colors focus:bg-white focus:outline-none"
                  >
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - QAR {s.pricingTiers[0]?.price ?? 0}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedService && selectedService.addons.length > 0 && (
                <div>
                  <label className="text-primary-dark mb-2 block text-sm font-medium">
                    Enhance with Add-ons
                  </label>
                  <div className="space-y-2">
                    {selectedService.addons.map((addon) => (
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
                          <span className="text-primary-dark font-medium">
                            {addon.name}
                          </span>
                          <span className="text-text-secondary">
                            + QAR {addon.price}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                Date & Time
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-primary-dark mb-1 block text-sm font-medium">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="text-text-secondary pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 py-3 pr-4 pl-11 transition-colors focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-primary-dark mb-1 block text-sm font-medium">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="text-text-secondary pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                    <input
                      required
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 py-3 pr-4 pl-11 transition-colors focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
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
                  {selectedService
                    ? basePrice +
                      selectedService.addons
                        .filter((a) => selectedAddons.includes(a.id))
                        .reduce((s, a) => s + a.price, 0)
                    : "0"}
                </p>
              </>
            )}
          </div>
          <button
            form="add-booking-form"
            type="submit"
            disabled={submitting}
            className="bg-primary flex shrink-0 items-center space-x-2 rounded-full px-8 py-3 font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
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
