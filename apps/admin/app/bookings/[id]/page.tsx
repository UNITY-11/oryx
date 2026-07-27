"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import {
  deleteBooking,
  fetchBooking,
  updateBooking,
} from "@features/bookings/api";
import { BookingWizard } from "@features/bookings/booking-wizard";
import { Booking, BookingStatus } from "@features/bookings/types";
import { fetchServices } from "@features/services/api";
import { Service } from "@features/services/types";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Editing wizard state derived from URL query
  const searchParams = useSearchParams();
  const isEditingWizard = searchParams.get("action") === "edit";
  const step = Number(searchParams.get("step")) || 1;
  const setStep = (newStep: number) =>
    router.push(`?action=edit&step=${newStep}`);
  const [isEditing, setIsEditing] = useState(false); // keep for legacy view mode
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const [realServices, setRealServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // POS State (service editor)
  const [posMode, setPosMode] = useState<"services" | "options">("services");
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchBooking(id)
      .then((data) => {
        // Older Sanity docs may have null options (or legacy addons)
        const normalized: Booking = {
          ...data,
          services: (data.services ?? []).map((svc) => ({
            ...svc,
            options: svc.options ?? [],
          })),
        };
        setBooking(normalized);
        setSavedBooking(normalized);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchServices()
      .then(setRealServices)
      .catch((err) => setServicesError(err.message))
      .finally(() => setServicesLoading(false));
  }, []);

  const activeService =
    activeServiceIndex !== null && booking
      ? booking.services[activeServiceIndex]
      : null;
  const currentServiceObject = useMemo(() => {
    return activeService
      ? realServices.find((s) => s.name === activeService.name)
      : null;
  }, [activeService, realServices]);

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p>Loading booking...</p>
      </div>
    );
  }

  if (loadError || !booking || !savedBooking) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="mb-4 text-lg">{loadError ?? "Booking not found."}</p>
        <button
          onClick={() => router.push("/bookings")}
          className="text-primary text-sm underline"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const isCompleted =
    booking.status === "Completed" || booking.status === "Cancelled";

  // Deep compare to detect changes
  const hasChanges = JSON.stringify(booking) !== JSON.stringify(savedBooking);

  const update = <K extends keyof Booking>(key: K, value: Booking[K]) =>
    setBooking((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateBooking(id, booking);
      setBooking(result);
      setSavedBooking(result);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSession = async () => {
    try {
      setSaving(true);
      await deleteBooking(id);
      router.push("/bookings");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to delete session"
      );
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const serviceObj = realServices.find((s) => s.id === serviceId);
    if (!serviceObj) return;

    setBooking((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.services.findIndex(
        (s) => s.name === serviceObj.name
      );

      if (existingIndex >= 0) {
        const removedService = prev.services[existingIndex]!;
        const basePrice = serviceObj.price || 0;
        const addonsPrice = (removedService.options ?? []).reduce(
          (sum, aName) => {
            const a = (serviceObj.options ?? []).find(
              (ad) => ad.name === aName
            );
            return sum + (a?.price || 0);
          },
          0
        );

        const newServices = [...prev.services];
        newServices.splice(existingIndex, 1);

        if (activeServiceIndex === existingIndex) {
          setPosMode("services");
          setActiveServiceIndex(null);
        } else if (
          activeServiceIndex !== null &&
          activeServiceIndex > existingIndex
        ) {
          setActiveServiceIndex(activeServiceIndex - 1);
        }

        return {
          ...prev,
          services: newServices,
          amount: prev.amount - basePrice - addonsPrice,
        };
      } else {
        const basePrice = serviceObj.price || 0;
        return {
          ...prev,
          services: [...prev.services, { name: serviceObj.name, options: [] }],
          amount: prev.amount + basePrice,
        };
      }
    });
  };

  const configureAddonsFor = (index: number) => {
    setActiveServiceIndex(index);
    setPosMode("options");
  };

  const toggleAddon = (addonName: string, addonPrice: number) => {
    if (activeServiceIndex === null) return;

    setBooking((prev) => {
      if (!prev) return prev;
      const newServices = [...prev.services];
      const service = { ...newServices[activeServiceIndex]! };
      const hasAddon = service.options?.includes(addonName) ?? false;

      service.options = hasAddon
        ? (service.options || []).filter((a) => a !== addonName)
        : [...(service.options || []), addonName];

      newServices[activeServiceIndex] = service;
      return {
        ...prev,
        services: newServices,
        amount: prev.amount + (hasAddon ? -addonPrice : addonPrice),
      };
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden pt-4 sm:gap-4">
      {/* ── Header ── */}
      <header className="border-primary/10 flex shrink-0 flex-col gap-3 rounded-2xl border bg-white px-3 py-2.5 shadow-sm sm:rounded-3xl sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <MobileMenuButton className="-ml-0" />
          <button
            type="button"
            onClick={() => {
              if (isEditingWizard) {
                router.push(`/bookings/${id}`);
              } else if (isEditing) {
                setIsEditing(false);
                setBooking(savedBooking);
              } else {
                router.back();
              }
            }}
            className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-primary-dark truncate font-serif text-base leading-tight font-medium sm:text-xl md:text-2xl">
              {booking.customerName}
            </h1>
            <p className="text-text-secondary truncate font-mono text-[10px] tracking-wider uppercase sm:text-xs">
              {booking.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end md:shrink-0">
          {!isEditing && !isEditingWizard && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                disabled={saving}
                className="border-primary text-primary hover:bg-primary/5 focus:ring-primary/20 inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus:ring-2 focus:outline-none sm:px-4 sm:text-sm"
              >
                <span className="max-w-[7rem] truncate sm:max-w-none">
                  {booking.status}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>

              {statusMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setStatusMenuOpen(false)}
                  />
                  <div className="border-primary/10 absolute left-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border bg-white py-1.5 shadow-xl sm:right-0 sm:left-auto sm:w-48">
                    {(
                      [
                        "Pending",
                        "Confirmed",
                        "Started",
                        "Completed",
                        "Cancelled",
                      ] as BookingStatus[]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={async () => {
                          setStatusMenuOpen(false);
                          if (s === booking.status) return;
                          try {
                            setSaving(true);
                            const result = await updateBooking(id, {
                              status: s,
                            });
                            setBooking(result);
                            setSavedBooking(result);
                          } catch (err) {
                            setSaveError(
                              err instanceof Error
                                ? err.message
                                : "Failed to update status"
                            );
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className={`hover:bg-primary/5 flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                          booking.status === s
                            ? "text-primary bg-primary/5 font-bold"
                            : "text-text-secondary font-medium"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!isEditing && !isEditingWizard && (
            <button
              type="button"
              onClick={handleDeleteSession}
              className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {!isCompleted && !isEditing && !isEditingWizard && (
            <button
              type="button"
              onClick={() => router.push(`?action=edit&step=1`)}
              className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setBooking(savedBooking);
                }}
                className="border-primary/30 text-text-secondary hover:bg-primary/5 inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Discard</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-sm transition-all sm:px-5 sm:text-sm ${
                  saved
                    ? "bg-green-500 text-white"
                    : hasChanges
                      ? "bg-primary text-white hover:opacity-90"
                      : "bg-primary/20 text-primary/40 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? "Saving…" : saved ? "Saved" : "Save"}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {saveError && (
        <div className="flex shrink-0 items-start gap-2 rounded-2xl bg-red-50 px-3.5 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* ── VIEW DETAILS ── */}
        {!isEditing && !isEditingWizard && (
          <div className="border-primary/10 scrollbar-hide h-full overflow-y-auto rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8 lg:p-10">
            <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
                <div className="border-primary/10 rounded-2xl border bg-[#fcf4f0] p-4 shadow-sm sm:rounded-3xl sm:p-6">
                  <h3 className="text-primary mb-3 text-[11px] font-bold tracking-wider uppercase sm:mb-4 sm:text-xs">
                    Customer
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-primary border-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white font-serif text-xl sm:h-16 sm:w-16 sm:text-2xl">
                      {booking.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-primary-dark truncate text-lg font-bold sm:text-xl">
                        {booking.customerName}
                      </h3>
                      <p className="text-text-secondary mt-0.5 truncate text-sm sm:mt-1">
                        {booking.phone || "No phone"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-primary/10 flex flex-col justify-center gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:gap-4 sm:rounded-3xl sm:p-6">
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <Calendar className="text-primary h-4 w-4 shrink-0" />
                    <span className="text-primary-dark font-medium">
                      {booking.date}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <Clock className="text-primary h-4 w-4 shrink-0" />
                    <span className="text-primary-dark font-medium">
                      {booking.time}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <User className="text-primary h-4 w-4 shrink-0" />
                    <span className="text-primary-dark font-medium">
                      {booking.services.length} Service
                      {booking.services.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-primary/10 rounded-2xl border bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
                <h3 className="text-primary mb-4 text-[11px] font-bold tracking-wider uppercase sm:mb-6 sm:text-xs">
                  Session Services
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-text-secondary border-primary/5 rounded-2xl border bg-[#fcf4f0] py-8 text-center text-sm italic">
                      No services selected.
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = realServices.find(
                        (r) => r.name === svc.name
                      );
                      const baseP = matchedObj?.price || 0;
                      return (
                        <div
                          key={idx}
                          className="border-primary/10 rounded-2xl border bg-[#fcf4f0] p-4 sm:p-5"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <span className="text-primary-dark text-base font-semibold sm:text-lg">
                              {svc.name}
                            </span>
                            <span className="text-primary-dark shrink-0 text-base font-semibold sm:text-lg">
                              QAR {baseP}
                            </span>
                          </div>
                          {(svc.options ?? []).length > 0 && (
                            <div className="border-primary/10 mt-3 space-y-2 border-t pt-3">
                              {(svc.options ?? []).map((option, aIdx) => {
                                const matchedAddon = (
                                  matchedObj?.options ?? []
                                ).find((a) => a.name === option);
                                return (
                                  <div
                                    key={aIdx}
                                    className="flex items-start justify-between gap-3 text-sm"
                                  >
                                    <span className="text-text-secondary flex min-w-0 items-start gap-2">
                                      <ChevronRight className="text-primary/40 mt-0.5 h-4 w-4 shrink-0" />
                                      <span className="break-words">
                                        {option}
                                      </span>
                                    </span>
                                    <span className="text-text-secondary shrink-0">
                                      {matchedAddon
                                        ? `+ QAR ${matchedAddon.price}`
                                        : "+"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-primary/10 mt-5 flex items-center justify-between gap-3 border-t pt-5 sm:mt-8 sm:pt-6">
                  <span className="text-text-secondary text-base font-bold sm:text-lg">
                    Total Amount
                  </span>
                  <span className="text-primary-dark text-xl font-bold sm:text-2xl">
                    QAR {booking.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT WIZARD ── */}
        {isEditingWizard && (
          <BookingWizard
            initialData={booking}
            step={step}
            setStep={setStep}
            onCancel={() => router.push(`/bookings/${id}`)}
            onSubmit={async (payload) => {
              const updated = await updateBooking(id, payload);
              setBooking(updated);
              setSavedBooking(updated);
              router.push(`/bookings/${id}`);
              setIsEditing(false);
            }}
          />
        )}

        {/* ── LEGACY EDIT MODE ── */}
        {isEditing && (
          <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden lg:flex-row lg:gap-4">
            <div className="border-primary/10 scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8 lg:p-10">
              {posMode === "services" && (
                <div className="animate-in fade-in duration-200">
                  <div className="mb-5 sm:mb-8">
                    <h2 className="text-primary-dark mb-1 font-serif text-xl sm:mb-2 sm:text-2xl">
                      Edit Session
                    </h2>
                    <p className="text-text-secondary text-sm">
                      Update date, time, status, and services.
                    </p>
                  </div>

                  <div className="border-primary/10 mb-5 grid grid-cols-1 gap-3 rounded-2xl border bg-[#fcf4f0] p-4 sm:mb-8 sm:gap-4 sm:p-6 md:grid-cols-3">
                    <div>
                      <label className="text-text-secondary mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                        <Calendar className="h-3 w-3" /> Date
                      </label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="border-primary/20 focus:border-primary text-primary-dark h-10 w-full rounded-xl border bg-white px-3 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                        <Clock className="h-3 w-3" /> Time
                      </label>
                      <input
                        type="time"
                        value={booking.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="border-primary/20 focus:border-primary text-primary-dark h-10 w-full rounded-xl border bg-white px-3 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1.5 block text-[10px] font-bold tracking-wider uppercase">
                        Status
                      </label>
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          update("status", e.target.value as BookingStatus)
                        }
                        className="border-primary/20 focus:border-primary text-primary-dark h-10 w-full rounded-xl border bg-white px-3 text-sm font-medium focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Started">Started</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="text-primary mb-3 text-[11px] font-bold tracking-wider uppercase sm:mb-4 sm:text-xs">
                    Service Catalog
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
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
                      {realServices.map((service) => {
                        const isSelected = booking.services.some(
                          (s) => s.name === service.name
                        );
                        return (
                          <div
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`group flex h-24 cursor-pointer flex-row items-center overflow-hidden rounded-2xl border transition-all sm:h-28 ${
                              isSelected
                                ? "border-primary ring-primary bg-primary/5 ring-2"
                                : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-md"
                            }`}
                          >
                            <div className="bg-primary/10 relative h-full w-20 shrink-0 overflow-hidden sm:w-28">
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="text-primary/40 bg-primary/5 flex h-full w-full items-center justify-center font-serif text-sm opacity-50">
                                  Oryx
                                </div>
                              )}
                              <div
                                className={`bg-primary/40 absolute inset-0 flex items-center justify-center backdrop-blur-[1px] transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                              >
                                <div className="text-primary flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                              </div>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-4">
                              <div className="bg-primary/10 text-primary mb-1 inline-block w-max rounded px-2 py-0.5 text-[10px] font-bold">
                                {service.category || "Service"}
                              </div>
                              <h3 className="text-primary-dark truncate text-sm leading-tight font-bold sm:text-base">
                                {service.name}
                              </h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {posMode === "options" &&
                currentServiceObject &&
                activeService && (
                  <div className="animate-in fade-in duration-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPosMode("services");
                        setActiveServiceIndex(null);
                      }}
                      className="text-primary mb-5 flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80 sm:mb-8"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to Catalog
                    </button>

                    <div className="border-primary/10 mb-5 flex flex-col gap-4 border-b pb-5 sm:mb-8 sm:flex-row sm:items-center sm:gap-6 sm:pb-8">
                      <div className="bg-primary/10 border-primary/20 mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-2xl border sm:mx-0 sm:h-24 sm:w-24">
                        {currentServiceObject.image ? (
                          <img
                            src={currentServiceObject.image}
                            alt={currentServiceObject.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-primary/40 flex h-full w-full items-center justify-center font-serif text-xs">
                            Oryx
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 text-center sm:text-left">
                        <h2 className="text-primary-dark mb-1 font-serif text-2xl sm:mb-2 sm:text-3xl">
                          {currentServiceObject.name}
                        </h2>
                        <p className="text-text-secondary text-sm">
                          Enhance this service with premium add-ons.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-primary mb-3 text-[11px] font-bold tracking-wider uppercase sm:mb-4 sm:text-sm">
                      Available Service Options
                    </h3>
                    {(currentServiceObject.options ?? []).length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {(currentServiceObject.options ?? []).map((option) => {
                          const isSelected = (
                            activeService.options ?? []
                          ).includes(option.name);
                          return (
                            <div
                              key={option.id}
                              onClick={() =>
                                toggleAddon(option.name, option.price)
                              }
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all sm:p-5 ${
                                isSelected
                                  ? "border-primary bg-primary ring-primary text-white shadow-md ring-1"
                                  : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-sm"
                              }`}
                            >
                              <div className="min-w-0">
                                <h4
                                  className={`truncate text-sm font-semibold ${isSelected ? "text-white" : "text-primary-dark"}`}
                                >
                                  {option.name}
                                </h4>
                                <span
                                  className={`text-xs font-bold ${isSelected ? "text-white" : "text-primary"}`}
                                >
                                  + QAR {option.price}
                                </span>
                              </div>
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-white bg-white/20" : "border-primary/20"}`}
                              >
                                {isSelected && (
                                  <Check className="h-4 w-4 text-white" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border-primary/10 bg-primary/5 rounded-2xl border border-dashed p-8 text-center sm:p-12">
                        <p className="text-primary-dark font-medium">
                          No Service Options Available
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="border-primary/10 scrollbar-hide flex max-h-[40vh] w-full shrink-0 flex-col overflow-y-auto rounded-2xl border bg-white shadow-sm sm:rounded-[28px] lg:max-h-none lg:w-[320px] xl:w-[360px]">
              <div className="flex h-full flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <div>
                  <h1 className="text-primary-dark mb-1 font-serif text-xl sm:text-2xl">
                    Session Cart
                  </h1>
                  <p className="text-text-secondary text-xs">
                    Services added to this booking.
                  </p>
                </div>

                <div className="min-h-0 flex-1 space-y-3 sm:space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-text-secondary border-primary/10 rounded-2xl border border-dashed bg-[#fcf4f0]/50 py-8 text-center text-sm italic">
                      Cart is empty
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = realServices.find(
                        (r) => r.name === svc.name
                      );
                      const baseP = matchedObj?.price || 0;
                      const isActive = activeServiceIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border bg-[#fcf4f0] p-3.5 transition-all sm:p-4 ${isActive ? "border-primary ring-primary shadow-sm ring-1" : "border-primary/10 hover:border-primary/30"}`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className="text-primary-dark min-w-0 text-sm font-semibold">
                              {svc.name}
                            </span>
                            <span className="text-primary-dark shrink-0 text-sm font-semibold">
                              QAR {baseP}
                            </span>
                          </div>
                          {(svc.options ?? []).length > 0 ? (
                            <div className="border-primary/10 mt-2 space-y-1.5 border-t pt-2">
                              {(svc.options ?? []).map((option, aIdx) => {
                                const matchedAddon = (
                                  matchedObj?.options ?? []
                                ).find((a) => a.name === option);
                                return (
                                  <div
                                    key={aIdx}
                                    className="flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="text-text-secondary flex min-w-0 items-center gap-1.5">
                                      <ChevronRight className="text-primary/40 h-3 w-3 shrink-0" />
                                      <span className="truncate">{option}</span>
                                    </span>
                                    <span className="text-text-secondary shrink-0">
                                      {matchedAddon
                                        ? `+ QAR ${matchedAddon.price}`
                                        : "+"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-text-secondary mt-1 text-[10px] italic">
                              No add-ons
                            </div>
                          )}
                          <div className="border-primary/10 mt-3 flex justify-end border-t pt-3 sm:mt-4">
                            <button
                              type="button"
                              onClick={() => configureAddonsFor(idx)}
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "border-primary/20 text-primary hover:bg-primary/5 border bg-white"
                              }`}
                            >
                              {isActive ? "Configuring" : "Edit Options"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-primary-dark mt-auto shrink-0 rounded-2xl p-4 text-white shadow-md sm:p-6">
                  <div className="mb-2 flex items-center justify-between text-sm opacity-80">
                    <span>Subtotal</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold sm:text-xl">
                    <span>Total</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="border-primary/10 w-full max-w-sm rounded-3xl border bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-primary-dark font-serif text-lg font-semibold">
                Delete Booking
              </h3>
            </div>
            <p className="text-text-secondary mb-5 text-sm leading-relaxed">
              Are you sure you want to delete this booking? This cannot be
              undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSession}
                disabled={saving}
                className="bg-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
