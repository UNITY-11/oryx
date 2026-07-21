"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, fetchBookings } from "@features/bookings/api";
import { Booking } from "@features/bookings/types";
import {
  fetchCustomer,
  updateCustomer,
  uploadCustomerAvatar,
} from "@features/customers/api";
import { Customer, CustomerTier } from "@features/customers/types";
import { fetchServices } from "@features/services/api";
import { Addon, PricingTier, Service } from "@features/services/types";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";

const TIERS: CustomerTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

function TierDropdown({
  value,
  onChange,
}: {
  value: CustomerTier;
  onChange: (v: CustomerTier) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border-primary/40 hover:border-primary focus:border-primary text-primary-dark flex w-full items-center justify-between rounded-2xl border bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          className={`text-primary/60 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(tier);
                setOpen(false);
              }}
              className={`hover:bg-primary/5 flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${tier === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{tier}</span>
              {tier === value && <Check className="text-primary h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  // Sessions State — derived from real bookings matching this customer
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Booking Modal State
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Booking Form fields
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingStaff, setBookingStaff] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchCustomer(id)
      .then((data) => setCustomer(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!customer) return;
    setSessionsLoading(true);
    fetchBookings()
      .then((all) =>
        setSessions(all.filter((b) => b.customerName === customer.name))
      )
      .catch((err) => setSessionsError(err.message))
      .finally(() => setSessionsLoading(false));
  }, [customer]);

  useEffect(() => {
    if (!showBooking || availableServices.length > 0) return;
    setServicesLoading(true);
    fetchServices()
      .then(setAvailableServices)
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
  }, [showBooking, availableServices.length]);

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p>Loading customer...</p>
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="mb-4 text-lg">{loadError ?? "Customer not found."}</p>
        <button
          onClick={() => router.push("/customers")}
          className="text-primary text-sm underline"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const update = <K extends keyof Customer>(key: K, value: Customer[K]) =>
    setCustomer((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let avatarUrl = customer.avatar;
      if (pendingAvatarFile) {
        avatarUrl = await uploadCustomerAvatar(pendingAvatarFile);
      }
      const result = await updateCustomer(id, {
        ...customer,
        avatar: avatarUrl,
      });
      setCustomer(result);
      setPendingAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Booking Handlers
  const handleServiceSelect = (svc: Service, tier: PricingTier) => {
    setSelectedService(svc);
    setSelectedTier(tier);
    setSelectedAddons([]);
    if (svc.addons.length > 0) {
      setBookingStep(2);
    } else {
      setBookingStep(3);
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const finalizeBooking = async () => {
    if (
      !selectedService ||
      !selectedTier ||
      !bookingDate ||
      !bookingTime ||
      !bookingStaff
    )
      return;

    const totalPrice =
      selectedTier.price +
      selectedAddons.reduce((acc, curr) => acc + curr.price, 0);

    setBookingSubmitting(true);
    setBookingSubmitError(null);
    try {
      const created = await createBooking({
        customerName: customer.name,
        phone: customer.phone,
        services: [
          {
            name: selectedService.name,
            addons: selectedAddons.map((a) => a.name),
          },
        ],
        date: bookingDate,
        time: bookingTime,
        status: "Confirmed",
        amount: totalPrice,
      });

      setSessions((prev) => [created, ...prev]);
      setShowBooking(false);

      // Reset state
      setBookingStep(1);
      setSelectedService(null);
      setSelectedTier(null);
      setSelectedAddons([]);
      setBookingDate("");
      setBookingTime("");
      setBookingStaff("");
    } catch (err) {
      setBookingSubmitError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-6 py-5 md:px-8">
          <button
            onClick={() => router.push("/customers")}
            className="text-text-secondary hover:text-primary-dark group flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Customers
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                update(
                  "status",
                  customer.status === "Active" ? "Inactive" : "Active"
                )
              }
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                customer.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {customer.status}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-60 ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-auto p-6 md:p-8">
          {saveError && (
            <div className="mx-auto mb-6 flex max-w-4xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Top Grid: Avatar (Left) + Form Details (Right) */}
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* LEFT — Avatar */}
              <div className="flex shrink-0 flex-col items-center gap-4 lg:w-48">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary/5 group relative h-40 w-40 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-md"
                >
                  {customer.avatar ? (
                    <>
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 absolute inset-0 flex flex-col items-center justify-center gap-1 transition-colors">
                      <span className="font-serif text-4xl">
                        {getInitials(customer.name)}
                      </span>
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <div className="mt-2 flex w-full justify-center gap-2">
                  <button
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="Call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="Message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 w-full space-y-1 text-center">
                  <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Total Spent
                  </p>
                  <p className="text-primary-dark text-lg font-bold">
                    QAR {customer.totalSpent}
                  </p>
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="min-w-0 flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Full Name
                    </label>
                    <input
                      value={customer.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-base font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Tier
                    </label>
                    <TierDropdown
                      value={customer.tier}
                      onChange={(v) => update("tier", v)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Age
                    </label>
                    <input
                      type="number"
                      value={customer.age || ""}
                      onChange={(e) => update("age", e.target.value)}
                      placeholder="e.g. 35"
                      className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Sessions History FULL WIDTH */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
                  Sessions History
                </h3>
                <button
                  onClick={() => setShowBooking(true)}
                  className="bg-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Session
                </button>
              </div>

              <div className="border-primary/10 overflow-hidden rounded-2xl border">
                <div className="text-text-secondary border-primary/10 grid grid-cols-[120px_1fr_100px_120px_100px] border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase">
                  <span>Date</span>
                  <span>Service</span>
                  <span>Time</span>
                  <span>Status</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-primary/5 divide-y bg-white">
                  {sessionsLoading ? (
                    <div className="text-text-secondary flex items-center justify-center gap-2 p-8 text-center text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      sessions...
                    </div>
                  ) : sessionsError ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-center text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" /> {sessionsError}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-text-secondary p-8 text-center text-sm">
                      No sessions found for this customer.
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => router.push(`/bookings/${session.id}`)}
                        className="hover:bg-primary/5 grid cursor-pointer grid-cols-[120px_1fr_100px_120px_100px] items-center px-6 py-4 text-sm transition-colors"
                      >
                        <span className="text-text-secondary font-medium">
                          {session.date}
                        </span>
                        <span className="text-primary-dark truncate pr-2 font-semibold">
                          {session.services.map((s) => s.name).join(", ") ||
                            "Custom Session"}
                        </span>
                        <span className="text-text-secondary">
                          {session.time}
                        </span>
                        <span
                          className={`inline-block w-fit self-start rounded-full border px-2.5 py-1 text-center text-[10px] font-bold tracking-wider uppercase ${
                            session.status === "Completed"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : session.status === "Cancelled"
                                ? "border-red-200 bg-red-50 text-red-600"
                                : session.status === "Started"
                                  ? "bg-primary-dark border-primary-dark text-white"
                                  : "border-amber-200 bg-amber-50 text-amber-600"
                          } `}
                        >
                          {session.status}
                        </span>
                        <span className="text-primary-dark text-right font-bold">
                          QAR {session.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Session Booking Overlay Modal */}
      {showBooking && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm md:p-8">
          <div className="border-primary/10 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-primary/10 flex items-center justify-between border-b bg-[#fcf4f0] px-6 py-5">
              <div>
                <h2 className="text-primary-dark font-serif text-lg font-medium">
                  Add New Session
                </h2>
                <p className="text-text-secondary text-xs">
                  Booking for {customer.name}
                </p>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="scrollbar-hide flex-1 overflow-auto p-6">
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-primary-dark mb-4 text-sm font-bold tracking-wider uppercase">
                    Step 1: Select Service & Tier
                  </h3>
                  {servicesLoading ? (
                    <div className="text-text-secondary flex items-center justify-center gap-2 py-10 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      services...
                    </div>
                  ) : servicesError ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" /> {servicesError}
                    </div>
                  ) : availableServices.filter((s) => s.status === "Active")
                      .length === 0 ? (
                    <div className="text-text-secondary py-10 text-center text-sm">
                      No active services available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {availableServices
                        .filter((s) => s.status === "Active")
                        .map((svc) => (
                          <div
                            key={svc.id}
                            className="border-primary/20 space-y-3 rounded-2xl border p-4"
                          >
                            <div className="text-primary-dark font-medium">
                              {svc.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {svc.pricingTiers.map((tier) => (
                                <button
                                  key={tier.id}
                                  onClick={() => handleServiceSelect(svc, tier)}
                                  className="border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl border px-4 py-2 text-left text-sm transition-colors"
                                >
                                  <div className="text-primary font-semibold">
                                    {tier.label}
                                  </div>
                                  <div className="text-text-secondary text-xs">
                                    QAR {tier.price}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {bookingStep === 2 && selectedService && (
                <div className="space-y-4">
                  <h3 className="text-primary-dark mb-4 text-sm font-bold tracking-wider uppercase">
                    Step 2: Select Add-ons
                  </h3>
                  <div className="space-y-3">
                    {selectedService.addons.map((addon) => {
                      const isSelected = selectedAddons.some(
                        (a) => a.id === addon.id
                      );
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-primary/20 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? "bg-primary border-primary" : "border-primary/30"}`}
                            >
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-white" />
                              )}
                            </div>
                            <span className="text-primary-dark text-sm font-medium">
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-primary text-sm font-semibold">
                            + QAR {addon.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setBookingStep(3)}
                      className="bg-primary rounded-full px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && selectedService && selectedTier && (
                <div className="space-y-6">
                  <h3 className="text-primary-dark mb-2 text-sm font-bold tracking-wider uppercase">
                    Step 3: Finalize Booking
                  </h3>

                  <div className="bg-primary/5 border-primary/10 rounded-2xl border p-4">
                    <div className="text-primary-dark font-semibold">
                      {selectedService.name} - {selectedTier.label}
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="text-text-secondary mt-1 text-xs">
                        + {selectedAddons.map((a) => a.name).join(", ")}
                      </div>
                    )}
                    <div className="text-primary mt-3 text-lg font-bold">
                      Total: QAR{" "}
                      {selectedTier.price +
                        selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                        Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                        Time
                      </label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Staff Member
                    </label>
                    <select
                      value={bookingStaff}
                      onChange={(e) => setBookingStaff(e.target.value)}
                      className="border-primary/40 focus:border-primary text-primary-dark w-full appearance-none rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                    >
                      <option value="">Select Staff...</option>
                      <option value="Maria">Maria</option>
                      <option value="Sarah">Sarah</option>
                      <option value="Elena">Elena</option>
                    </select>
                  </div>

                  {bookingSubmitError && (
                    <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {bookingSubmitError}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() =>
                        setBookingStep(
                          selectedService.addons.length > 0 ? 2 : 1
                        )
                      }
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Back
                    </button>
                    <button
                      onClick={finalizeBooking}
                      disabled={
                        !bookingDate ||
                        !bookingTime ||
                        !bookingStaff ||
                        bookingSubmitting
                      }
                      className="bg-primary flex items-center gap-2 rounded-full px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {bookingSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {bookingSubmitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
