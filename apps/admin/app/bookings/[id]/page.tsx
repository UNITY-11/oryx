"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Play,
  Save,
  User,
  X,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  fetchBooking,
  updateBooking,
  deleteBooking,
} from "@features/bookings/api";
import { BookingWizard } from "@features/bookings/booking-wizard";
import {
  Booking,
  BookingStatus,
} from "@features/bookings/mock-data";
import { fetchServices } from "@features/services/api";
import { Service } from "@features/services/mock-data";

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
  const isEditingWizard = searchParams.get('action') === 'edit';
  const step = Number(searchParams.get('step')) || 1;
  const setStep = (newStep: number) => router.push(`?action=edit&step=${newStep}`);
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
  const [posMode, setPosMode] = useState<"services" | "addons">("services");
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchBooking(id)
      .then((data) => {
        setBooking(data);
        setSavedBooking(data);
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
  const canStart =
    booking.status === "Pending" || booking.status === "Confirmed";

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

  const handleStartSession = async () => {
    try {
      const result = await updateBooking(id, { status: "Started" });
      setBooking(result);
      setSavedBooking(result);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to start session"
      );
    }
  };

  const handleCancelSession = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const result = await updateBooking(id, { status: "Cancelled" });
      setBooking(result);
      setSavedBooking(result);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to cancel session"
      );
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
        const basePrice = serviceObj.pricingTiers?.[0]?.price || 0;
        const addonsPrice = removedService.addons.reduce((sum, aName) => {
          const a = serviceObj.addons.find((ad) => ad.name === aName);
          return sum + (a?.price || 0);
        }, 0);

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
        const basePrice = serviceObj.pricingTiers?.[0]?.price || 0;
        return {
          ...prev,
          services: [...prev.services, { name: serviceObj.name, addons: [] }],
          amount: prev.amount + basePrice,
        };
      }
    });
  };

  const configureAddonsFor = (index: number) => {
    setActiveServiceIndex(index);
    setPosMode("addons");
  };

  const toggleAddon = (addonName: string, addonPrice: number) => {
    if (activeServiceIndex === null) return;

    setBooking((prev) => {
      if (!prev) return prev;
      const newServices = [...prev.services];
      const service = { ...newServices[activeServiceIndex]! };
      const hasAddon = service.addons?.includes(addonName) ?? false;

      service.addons = hasAddon
        ? (service.addons || []).filter((a) => a !== addonName)
        : [...(service.addons || []), addonName];

      newServices[activeServiceIndex] = service;
      return {
        ...prev,
        services: newServices,
        amount: prev.amount + (hasAddon ? -addonPrice : addonPrice),
      };
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 pt-4 pb-4">
        <header className="border-primary/10 z-30 flex h-20 w-full items-center justify-between rounded-3xl border bg-white/90 px-6 shadow-sm backdrop-blur-xl lg:px-10">
          {/* Left: back arrow + title */}
          <div className="flex flex-1 items-center gap-4">
            <button
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
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-[#fcf4f0] transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-primary-dark font-serif text-2xl leading-tight font-medium">
                {booking.customerName}
              </h1>
              <p className="text-text-secondary font-mono text-xs tracking-wider uppercase">
                {booking.id}
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex shrink-0 items-center gap-3">
            {!isEditing && !isEditingWizard && (
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  disabled={saving}
                  className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {booking.status}
                  <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                </button>

                {statusMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setStatusMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-primary/10 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                      {(["Pending", "Confirmed", "Started", "Completed", "Cancelled"] as BookingStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={async () => {
                            setStatusMenuOpen(false);
                            if (s === booking.status) return;
                            try {
                              setSaving(true);
                              const result = await updateBooking(id, { status: s });
                              setBooking(result);
                              setSavedBooking(result);
                            } catch (err) {
                              setSaveError(err instanceof Error ? err.message : "Failed to update status");
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm transition-colors hover:bg-primary/5 flex items-center gap-3 ${booking.status === s ? 'text-primary font-bold bg-primary/5' : 'text-text-secondary font-medium'}`}
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
                onClick={handleDeleteSession}
                className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}



            {!isCompleted && !isEditing && !isEditingWizard && (
              <button
                onClick={() => router.push(`?action=edit&step=1`)}
                className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            )}

            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setBooking(savedBooking);
                  }}
                  className="border-primary/30 text-text-secondary hover:bg-primary/5 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  <X className="h-4 w-4" />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition-all ${
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
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {saveError && (
        <div className="mb-4 flex shrink-0 items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── VIEW / EDIT DETAILS ── */}
        {!isEditing && !isEditingWizard && (
          <div className="border-primary/10 scrollbar-hide h-full overflow-y-auto rounded-[32px] border bg-white p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-4xl space-y-8">


              {/* Customer & Schedule */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border-primary/10 rounded-3xl border bg-[#fcf4f0] p-6 shadow-sm">
                  <h3 className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
                    Customer
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-primary border-primary/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-white font-serif text-2xl">
                      {booking.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-primary-dark text-xl font-bold">
                        {booking.customerName}
                      </h3>
                      <p className="text-text-secondary mt-1">
                        {booking.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-primary/10 flex flex-col justify-center space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <Calendar className="text-primary h-4 w-4" />
                    <span className="text-primary-dark font-medium">
                      {booking.date}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <Clock className="text-primary h-4 w-4" />
                    <span className="text-primary-dark font-medium">
                      {booking.time}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <User className="text-primary h-4 w-4" />
                    <span className="text-primary-dark font-medium">
                      {booking.services.length} Service(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="border-primary/10 rounded-3xl border bg-white p-6 shadow-sm md:p-8">
                <h3 className="text-primary mb-6 text-xs font-bold tracking-wider uppercase">
                  Session Services
                </h3>
                <div className="space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-text-secondary border-primary/5 rounded-2xl border bg-[#fcf4f0] py-8 text-center italic">
                      No services selected.
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = realServices.find(
                        (r) => r.name === svc.name
                      );
                      const baseP = matchedObj?.pricingTiers?.[0]?.price || 0;
                      return (
                        <div
                          key={idx}
                          className="border-primary/10 rounded-2xl border bg-[#fcf4f0] p-5"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-primary-dark text-lg font-semibold">
                              {svc.name}
                            </span>
                            <span className="text-primary-dark text-lg font-semibold">
                              QAR {baseP}
                            </span>
                          </div>
                          {svc.addons.length > 0 && (
                            <div className="border-primary/10 mt-3 space-y-2 border-t pt-3">
                              {svc.addons.map((addon, aIdx) => {
                                const matchedAddon = matchedObj?.addons.find(
                                  (a) => a.name === addon
                                );
                                return (
                                  <div
                                    key={aIdx}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-text-secondary flex items-center gap-2">
                                      <ChevronRight className="text-primary/40 h-4 w-4" />{" "}
                                      {addon}
                                    </span>
                                    <span className="text-text-secondary">
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

                <div className="border-primary/10 mt-8 flex items-center justify-between border-t pt-6">
                  <span className="text-text-secondary text-lg font-bold">
                    Total Amount
                  </span>
                  <span className="text-primary-dark text-2xl font-bold">
                    QAR {booking.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT MODE ── */}
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

        {isEditing && (
          <div className="flex h-full w-full gap-4">
            {/* LEFT: Service Catalog / Add-ons */}
            <div className="border-primary/10 scrollbar-hide flex-1 overflow-y-auto rounded-[32px] border bg-white p-6 shadow-sm md:p-10">
              {posMode === "services" && (
                <div className="animate-in fade-in duration-200">
                  <div className="mb-8">
                    <h2 className="text-primary-dark mb-2 font-serif text-2xl">
                      Edit Session
                    </h2>
                    <p className="text-text-secondary text-sm">
                      Update date, time, status, and services.
                    </p>
                  </div>

                  {/* Date / Time / Status */}
                  <div className="border-primary/10 mb-8 grid grid-cols-1 gap-4 rounded-2xl border bg-[#fcf4f0] p-6 md:grid-cols-3">
                    <div>
                      <label className="text-text-secondary mb-1 block flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                        <Calendar className="h-3 w-3" /> Date
                      </label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                        <Clock className="h-3 w-3" /> Time
                      </label>
                      <input
                        type="time"
                        value={booking.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold tracking-wider uppercase">
                        Status
                      </label>
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          update("status", e.target.value as BookingStatus)
                        }
                        className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Started">Started</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Service catalog */}
                  <h3 className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
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
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {realServices.map((service) => {
                        const isSelected = booking.services.some(
                          (s) => s.name === service.name
                        );
                        return (
                          <div
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`group flex h-28 cursor-pointer flex-row items-center overflow-hidden rounded-2xl border transition-all ${
                              isSelected
                                ? "border-primary ring-primary bg-primary/5 ring-2"
                                : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-md"
                            }`}
                          >
                            <div className="bg-primary/10 relative h-full w-28 shrink-0 overflow-hidden">
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
                            <div className="flex flex-1 flex-col justify-center p-4">
                              <div className="bg-primary/10 text-primary mb-1 inline-block w-max rounded px-2 py-0.5 text-[10px] font-bold">
                                {service.category || "Service"}
                              </div>
                              <h3 className="text-primary-dark text-base leading-tight font-bold">
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

              {posMode === "addons" &&
                currentServiceObject &&
                activeService && (
                  <div className="animate-in fade-in duration-200">
                    <button
                      onClick={() => {
                        setPosMode("services");
                        setActiveServiceIndex(null);
                      }}
                      className="text-primary mb-8 flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to Catalog
                    </button>

                    <div className="border-primary/10 mb-8 flex items-center gap-6 border-b pb-8">
                      <div className="bg-primary/10 border-primary/20 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border">
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
                      <div>
                        <h2 className="text-primary-dark mb-2 font-serif text-3xl">
                          {currentServiceObject.name}
                        </h2>
                        <p className="text-text-secondary text-sm">
                          Enhance this service with premium add-ons.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-primary mb-4 text-sm font-bold tracking-wider uppercase">
                      Available Add-ons
                    </h3>
                    {currentServiceObject.addons.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {currentServiceObject.addons.map((addon) => {
                          const isSelected = activeService.addons.includes(
                            addon.name
                          );
                          return (
                            <div
                              key={addon.id}
                              onClick={() =>
                                toggleAddon(addon.name, addon.price)
                              }
                              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary ring-primary text-white shadow-md ring-1"
                                  : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-sm"
                              }`}
                            >
                              <div>
                                <h4
                                  className={`text-sm font-semibold ${isSelected ? "text-white" : "text-primary-dark"}`}
                                >
                                  {addon.name}
                                </h4>
                                <span
                                  className={`text-xs font-bold ${isSelected ? "text-white" : "text-primary"}`}
                                >
                                  + QAR {addon.price}
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
                      <div className="border-primary/10 bg-primary/5 rounded-2xl border border-dashed p-12 text-center">
                        <p className="text-primary-dark font-medium">
                          No Add-ons Available
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* RIGHT: Cart Summary */}
            <div className="border-primary/10 scrollbar-hide flex w-full shrink-0 flex-col overflow-y-auto rounded-[32px] border bg-white shadow-sm lg:w-[340px] xl:w-[380px]">
              <div className="flex h-full flex-col space-y-6 p-6">
                <div>
                  <h1 className="text-primary-dark mb-1 font-serif text-2xl">
                    Session Cart
                  </h1>
                  <p className="text-text-secondary text-xs">
                    Services added to this booking.
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-text-secondary border-primary/10 rounded-2xl border border-dashed bg-[#fcf4f0]/50 py-8 text-center text-sm italic">
                      Cart is empty
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = realServices.find(
                        (r) => r.name === svc.name
                      );
                      const baseP = matchedObj?.pricingTiers?.[0]?.price || 0;
                      const isActive = activeServiceIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border bg-[#fcf4f0] p-4 transition-all ${isActive ? "border-primary ring-primary shadow-sm ring-1" : "border-primary/10 hover:border-primary/30"}`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-primary-dark pr-2 text-sm font-semibold">
                              {svc.name}
                            </span>
                            <span className="text-primary-dark shrink-0 text-sm font-semibold">
                              QAR {baseP}
                            </span>
                          </div>
                          {svc.addons.length > 0 ? (
                            <div className="border-primary/10 mt-2 space-y-1.5 border-t pt-2">
                              {svc.addons.map((addon, aIdx) => {
                                const matchedAddon = matchedObj?.addons.find(
                                  (a) => a.name === addon
                                );
                                return (
                                  <div
                                    key={aIdx}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-text-secondary flex items-center gap-1.5">
                                      <ChevronRight className="text-primary/40 h-3 w-3" />{" "}
                                      {addon}
                                    </span>
                                    <span className="text-text-secondary">
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
                          <div className="border-primary/10 mt-4 flex justify-end gap-2 border-t pt-3">
                            <button
                              onClick={() => configureAddonsFor(idx)}
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "border-primary/20 text-primary hover:bg-primary/5 border bg-white"
                              }`}
                            >
                              {isActive ? "Configuring" : "Edit Add-ons"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-primary-dark mt-auto shrink-0 rounded-2xl p-6 text-white shadow-md">
                  <div className="mb-2 flex items-center justify-between text-sm opacity-80">
                    <span>Subtotal</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif text-primary-dark font-semibold">Delete Booking</h3>
            </div>
            <p className="text-text-secondary mb-8">
              Are you sure you want to completely delete this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSession}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
