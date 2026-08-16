"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Service, ServiceOption } from "@/features/services/types";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { PhoneInput } from "@/shared/ui/phone-input";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { createBooking, fetchBookings } from "@features/bookings/api";
import { Booking } from "@features/bookings/types";
import {
  fetchCustomer,
  updateCustomer,
  uploadCustomerAvatar,
} from "@features/customers/api";
import { Customer, CustomerTier } from "@features/customers/types";
import {
  hasCustomerFieldErrors,
  validateBookingFields,
  validateCustomer,
  validateCustomerAvatarFile,
  type CustomerFieldErrors,
} from "@features/customers/validation";
import { fetchServices } from "@features/services/api";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";

const TIERS: CustomerTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

const inputClass =
  "border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-60";
const inputErrorClass = "border-red-400 focus:border-red-500";
const labelClass =
  "text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function TierDropdown({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: CustomerTier;
  onChange: (v: CustomerTier) => void;
  disabled?: boolean;
  hasError?: boolean;
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
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${inputClass} flex items-center justify-between ${hasError ? inputErrorClass : ""}`}
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
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const [sessions, setSessions] = useState<Booking[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<ServiceOption[]>([]);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingFieldErrors, setBookingFieldErrors] = useState<
    Partial<Record<"date" | "time" | "options", string>>
  >({});

  const loadCustomer = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchCustomer(id)
      .then((data) => {
        setCustomer(data);
        setInitialSnapshot(formSnapshot(data));
        setPendingAvatarFile(null);
        setFieldErrors({});
      })
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load customer"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    if (!customer) return;
    setSessionsLoading(true);
    setSessionsError(null);
    fetchBookings()
      .then((all) =>
        setSessions(
          all.filter(
            (b) =>
              b.customerId === customer.id ||
              (customer.phone && b.phone === customer.phone)
          )
        )
      )
      .catch((err) =>
        setSessionsError(
          err instanceof Error ? err.message : "Failed to load sessions"
        )
      )
      .finally(() => setSessionsLoading(false));
  }, [customer?.id, customer?.phone]);

  const isDirty = useMemo(() => {
    if (!customer) return false;
    return isFormDirty(customer, initialSnapshot) || Boolean(pendingAvatarFile);
  }, [customer, initialSnapshot, pendingAvatarFile]);

  useEffect(() => {
    if (!showBooking || availableServices.length > 0) return;
    setServicesLoading(true);
    fetchServices()
      .then(setAvailableServices)
      .catch((err) =>
        setServicesError(
          err instanceof Error ? err.message : "Failed to load services"
        )
      )
      .finally(() => setServicesLoading(false));
  }, [showBooking, availableServices.length]);

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading customer...</p>
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="text-primary-dark mb-1 text-lg font-semibold">
          Customer unavailable
        </p>
        <p className="text-text-secondary mb-5 max-w-sm text-sm">
          {loadError ?? "This customer could not be found."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={loadCustomer}
            className="border-primary text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.push("/customers")}
            className="bg-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const update = <K extends keyof Customer>(key: K, value: Customer[K]) => {
    setCustomer((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => {
      if (!prev[key as keyof CustomerFieldErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof CustomerFieldErrors];
      return next;
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageError = validateCustomerAvatarFile(file);
    if (imageError) {
      setFieldErrors((prev) => ({ ...prev, avatar: imageError }));
      setToast({ type: "error", message: imageError });
      e.target.value = "";
      return;
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });
    setPendingAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!customer || !isDirty) return;
    const errors = validateCustomer(customer);
    if (hasCustomerFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = customer.avatar;
      if (pendingAvatarFile) {
        avatarUrl = await uploadCustomerAvatar(pendingAvatarFile);
      }
      // Phone is immutable — never send phone updates from the edit page
      const { phone: _phone, ...editable } = customer;
      const result = await updateCustomer(id, {
        ...editable,
        name: customer.name.trim(),
        email: customer.email.trim(),
        avatar: avatarUrl,
      });
      setCustomer(result);
      setInitialSnapshot(formSnapshot(result));
      setPendingAvatarFile(null);
      setFieldErrors({});
      setToast({ type: "success", message: "Customer saved successfully" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save changes",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const handleServiceSelect = (svc: Service) => {
    setSelectedService(svc);
    setSelectedOptions([]);
    setBookingStep(svc.options.length > 0 ? 2 : 3);
  };

  const toggleAddon = (option: ServiceOption) => {
    setBookingFieldErrors((prev) => {
      const next = { ...prev };
      delete next.options;
      return next;
    });
    setSelectedOptions((prev) =>
      prev.find((a) => a.id === option.id)
        ? prev.filter((a) => a.id !== option.id)
        : [...prev, option]
    );
  };

  const finalizeBooking = async () => {
    if (!selectedService) return;

    if (selectedService.options.length > 0 && selectedOptions.length === 0) {
      setBookingFieldErrors((prev) => ({
        ...prev,
        options: "Select at least one service option",
      }));
      setToast({
        type: "error",
        message: "Select service options before confirming",
      });
      return;
    }

    const errors = validateBookingFields({
      date: bookingDate,
      time: bookingTime,
    });
    if (Object.values(errors).some(Boolean)) {
      setBookingFieldErrors(errors);
      setToast({ type: "error", message: "Please complete booking details" });
      return;
    }

    const totalPrice =
      selectedService.price +
      selectedOptions.reduce((acc, curr) => acc + curr.price, 0);

    setBookingSubmitting(true);
    try {
      const created = await createBooking({
        customerName: customer.name,
        phone: customer.phone,
        services: [
          {
            name: selectedService.name,
            options: selectedOptions.map((a) => a.name),
          },
        ],
        date: bookingDate,
        time: bookingTime,
        status: "Confirmed",
        amount: totalPrice,
      });

      setSessions((prev) => [created, ...prev]);
      setShowBooking(false);
      setBookingStep(1);
      setSelectedService(null);
      setSelectedOptions([]);
      setBookingDate("");
      setBookingTime("");
      setBookingFieldErrors({});
      setToast({ type: "success", message: "Session booked successfully" });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to create booking",
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const phoneDigits = customer.phone.replace(/\D/g, "");

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <button
              type="button"
              onClick={() => router.push("/customers")}
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                {customer.name}
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                {customer.tier} · {customer.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() =>
                update(
                  "status",
                  customer.status === "Active" ? "Inactive" : "Active"
                )
              }
              disabled={saving}
              className={`rounded-full border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors sm:px-4 sm:text-xs ${
                customer.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-500"
              }`}
            >
              {customer.status}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="bg-primary inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Saving…" : "Save"}</span>
            </button>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10 md:space-y-12">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
              <div className="flex shrink-0 flex-col items-center gap-3 sm:gap-4 lg:w-48">
                <div
                  onClick={() => !saving && fileInputRef.current?.click()}
                  className={`bg-primary/5 group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-md sm:h-40 sm:w-40 ${fieldErrors.avatar ? "ring-2 ring-red-400" : ""}`}
                >
                  {customer.avatar ? (
                    <>
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 absolute inset-0 flex flex-col items-center justify-center gap-1 transition-colors">
                      <span className="font-serif text-3xl sm:text-4xl">
                        {getInitials(customer.name)}
                      </span>
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <FieldError message={fieldErrors.avatar} />

                <div className="mt-1 flex w-full max-w-xs justify-center gap-2">
                  <a
                    href={`tel:${customer.phone}`}
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="Call"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={`sms:${customer.phone}`}
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="Message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-primary/5 hover:bg-primary/10 text-primary flex flex-1 items-center justify-center rounded-full p-3 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-1 w-full space-y-1 text-center">
                  <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Total Spent
                  </p>
                  <p className="text-primary-dark text-lg font-bold">
                    QAR {customer.totalSpent}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      value={customer.name}
                      disabled={saving}
                      onChange={(e) => update("name", e.target.value)}
                      className={`${inputClass} text-base font-medium ${fieldErrors.name ? inputErrorClass : ""}`}
                    />
                    <FieldError message={fieldErrors.name} />
                  </div>
                  <div>
                    <label className={labelClass}>Tier *</label>
                    <TierDropdown
                      value={customer.tier}
                      disabled={saving}
                      hasError={Boolean(fieldErrors.tier)}
                      onChange={(v) => update("tier", v)}
                    />
                    <FieldError message={fieldErrors.tier} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={customer.email}
                      disabled={saving}
                      onChange={(e) => update("email", e.target.value)}
                      className={`${inputClass} ${fieldErrors.email ? inputErrorClass : ""}`}
                    />
                    <FieldError message={fieldErrors.email} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <PhoneInput
                      value={customer.phone}
                      onChange={() => {}}
                      readOnly
                      disabled
                    />
                    <p className="text-text-secondary mt-1.5 text-xs">
                      Phone number cannot be changed. It links this customer to
                      their bookings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      disabled={saving}
                      value={customer.age || ""}
                      onChange={(e) => update("age", e.target.value)}
                      placeholder="e.g. 35"
                      className={`${inputClass} ${fieldErrors.age ? inputErrorClass : ""}`}
                    />
                    <FieldError message={fieldErrors.age} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
                  Sessions History
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBooking(true)}
                  className="bg-primary inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Session
                </button>
              </div>

              <div className="border-primary/10 overflow-hidden rounded-2xl border">
                <div className="text-text-secondary border-primary/10 hidden grid-cols-[120px_1fr_100px_120px_100px] border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase md:grid">
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
                    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-red-500">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> {sessionsError}
                      </span>
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
                        className="hover:bg-primary/5 grid cursor-pointer grid-cols-1 gap-2 px-4 py-4 text-sm transition-colors sm:px-6 md:grid-cols-[120px_1fr_100px_120px_100px] md:items-center"
                      >
                        <div className="flex items-start justify-between gap-2 md:contents">
                          <span className="text-text-secondary font-medium">
                            {session.date}
                          </span>
                          <span className="text-primary-dark shrink-0 font-bold md:hidden md:text-right">
                            QAR {session.amount}
                          </span>
                        </div>
                        <span className="text-primary-dark truncate pr-2 font-semibold">
                          {session.services.map((s) => s.name).join(", ") ||
                            "Custom Session"}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 md:contents">
                          <span className="text-text-secondary">
                            {session.time}
                          </span>
                          <span
                            className={`inline-block w-fit rounded-full border px-2.5 py-1 text-center text-[10px] font-bold tracking-wider uppercase ${
                              session.status === "Completed"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : session.status === "Cancelled"
                                  ? "border-red-200 bg-red-50 text-red-600"
                                  : session.status === "Started"
                                    ? "bg-primary-dark border-primary-dark text-white"
                                    : "border-amber-200 bg-amber-50 text-amber-600"
                            }`}
                          >
                            {session.status}
                          </span>
                          <span className="text-primary-dark hidden text-right font-bold md:block">
                            QAR {session.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/20 backdrop-blur-sm sm:items-center sm:p-4 md:p-8">
          <div className="border-primary/10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border bg-white shadow-2xl sm:rounded-[32px]">
            <div className="border-primary/10 flex items-center justify-between gap-3 border-b bg-[#fcf4f0] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-primary-dark truncate font-serif text-base font-medium sm:text-lg">
                  Add New Session
                </h2>
                <p className="text-text-secondary truncate text-xs">
                  Booking for {customer.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBooking(false)}
                className="text-primary hover:bg-primary/10 shrink-0 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-primary-dark mb-2 text-sm font-bold tracking-wider uppercase sm:mb-4">
                    Step 1: Select Service
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
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => handleServiceSelect(svc)}
                            className="border-primary/20 hover:border-primary hover:bg-primary/5 flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors"
                          >
                            <span className="text-primary-dark font-medium">
                              {svc.name}
                            </span>
                            <span className="text-primary text-sm font-semibold">
                              QAR {svc.price}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {bookingStep === 2 && selectedService && (
                <div className="space-y-4">
                  <h3 className="text-primary-dark mb-2 text-sm font-bold tracking-wider uppercase sm:mb-4">
                    Step 2: Select Service Options
                  </h3>
                  <div className="space-y-3">
                    {selectedService.options.map((option) => {
                      const isSelected = selectedOptions.some(
                        (a) => a.id === option.id
                      );
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleAddon(option)}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-primary/20 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? "bg-primary border-primary" : "border-primary/30"}`}
                            >
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-white" />
                              )}
                            </div>
                            <span className="text-primary-dark truncate text-sm font-medium">
                              {option.name}
                            </span>
                          </div>
                          <span className="text-primary shrink-0 text-sm font-semibold">
                            + QAR {option.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col items-end gap-2 pt-4">
                    {selectedService.options.length > 0 &&
                      selectedOptions.length === 0 && (
                        <p className="w-full text-center text-sm text-amber-700 sm:text-right">
                          Select at least one option to continue.
                        </p>
                      )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          selectedService.options.length > 0 &&
                          selectedOptions.length === 0
                        ) {
                          setBookingFieldErrors((prev) => ({
                            ...prev,
                            options: "Select at least one service option",
                          }));
                          return;
                        }
                        setBookingFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.options;
                          return next;
                        });
                        setBookingStep(3);
                      }}
                      disabled={
                        selectedService.options.length > 0 &&
                        selectedOptions.length === 0
                      }
                      className="bg-primary rounded-full px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && selectedService && (
                <div className="space-y-5 sm:space-y-6">
                  <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
                    Step 3: Finalize Booking
                  </h3>

                  <div className="bg-primary/5 border-primary/10 rounded-2xl border p-4">
                    <div className="text-primary-dark font-semibold">
                      {selectedService.name}
                    </div>
                    {selectedOptions.length > 0 && (
                      <div className="text-text-secondary mt-1 text-xs">
                        + {selectedOptions.map((a) => a.name).join(", ")}
                      </div>
                    )}
                    <div className="text-primary mt-3 text-lg font-bold">
                      Total: QAR{" "}
                      {selectedService.price +
                        selectedOptions.reduce((sum, a) => sum + a.price, 0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Date *</label>
                      <input
                        type="date"
                        value={bookingDate}
                        min={(() => {
                          const today = new Date();
                          const y = today.getFullYear();
                          const m = String(today.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const d = String(today.getDate()).padStart(2, "0");
                          return `${y}-${m}-${d}`;
                        })()}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          setBookingFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.date;
                            return next;
                          });
                        }}
                        className={`${inputClass} ${bookingFieldErrors.date ? inputErrorClass : ""}`}
                      />
                      <FieldError message={bookingFieldErrors.date} />
                    </div>
                    <div>
                      <label className={labelClass}>Time *</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => {
                          setBookingTime(e.target.value);
                          setBookingFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.time;
                            return next;
                          });
                        }}
                        className={`${inputClass} ${bookingFieldErrors.time ? inputErrorClass : ""}`}
                      />
                      <FieldError message={bookingFieldErrors.time} />
                    </div>
                  </div>
                  <FieldError message={bookingFieldErrors.options} />

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBookingStep(
                          selectedService.options.length > 0 ? 2 : 1
                        )
                      }
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={finalizeBooking}
                      disabled={bookingSubmitting}
                      className="bg-primary flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-8"
                    >
                      {bookingSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {bookingSubmitting ? "Booking…" : "Confirm Booking"}
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
