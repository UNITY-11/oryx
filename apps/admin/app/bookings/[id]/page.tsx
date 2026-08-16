"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { getServiceLineItems } from "@features/billing/api/use-billing-data";
import {
  applyMembershipDiscountToBooking,
  getInvoiceSummary,
} from "@features/billing/invoice-summary";
import { PrintModal } from "@features/billing/ui/print-modal";
import {
  deleteBooking,
  fetchBooking,
  sendBookingInvoiceWhatsApp,
  updateBooking,
} from "@features/bookings/api";
import { filterServicesByQuery } from "@features/bookings/filter-services";
import { canPrintBookingInvoice } from "@features/bookings/service-validation";
import {
  Booking,
  BookingStatus,
  getBookingDisplayId,
} from "@features/bookings/types";
import { fetchCompany } from "@features/company/api";
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
  Loader2,
  MessageCircle,
  Plus,
  Printer,
  Search,
  Trash2,
  User,
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const [realServices, setRealServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [gymDiscountPercent, setGymDiscountPercent] = useState(0);
  const [membershipInput, setMembershipInput] = useState("");
  const [membershipSaving, setMembershipSaving] = useState(false);
  const [isManagingServices, setIsManagingServices] = useState(false);
  const [servicesSaving, setServicesSaving] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPersistRef = useRef<Booking | null>(null);

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

  useEffect(() => {
    fetchCompany()
      .then((company) =>
        setGymDiscountPercent(company?.gymMembershipDiscountPercent ?? 0)
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setMembershipInput(booking?.membershipId ?? "");
  }, [booking?.id]);

  const activeService =
    activeServiceIndex !== null && booking
      ? booking.services[activeServiceIndex]
      : null;
  const currentServiceObject = useMemo(() => {
    return activeService
      ? realServices.find((s) => s.name === activeService.name)
      : null;
  }, [activeService, realServices]);

  const filteredCatalogServices = useMemo(
    () => filterServicesByQuery(realServices, serviceSearchQuery),
    [realServices, serviceSearchQuery]
  );

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
  const canPrint = booking.status === "Completed";
  const printValidation = canPrintBookingInvoice(booking, realServices);
  const canPrintInvoice = canPrint && printValidation.allowed;
  const invoiceLines = getServiceLineItems(booking, realServices);
  const invoiceSummary = getInvoiceSummary(booking, realServices);

  const syncBookingDiscount = (b: Booking): Booking => {
    const membershipId = b.membershipId?.trim() ?? "";
    const discountPercent = b.discountPercent ?? 0;
    if (!membershipId || discountPercent <= 0) {
      return applyMembershipDiscountToBooking(b, realServices, "", 0);
    }
    return applyMembershipDiscountToBooking(
      b,
      realServices,
      membershipId,
      discountPercent
    );
  };

  const persistMembershipChange = async (updated: Booking) => {
    setMembershipSaving(true);
    setSaveError(null);
    try {
      const result = await updateBooking(id, {
        membershipId: updated.membershipId,
        discountPercent: updated.discountPercent,
        discountAmount: updated.discountAmount,
        subtotal: updated.subtotal,
        amount: updated.amount,
      });
      setBooking(result);
      setSavedBooking(result);
      setMembershipInput(result.membershipId ?? "");
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update membership discount"
      );
      setMembershipInput(booking.membershipId ?? "");
    } finally {
      setMembershipSaving(false);
    }
  };

  const persistBookingUpdate = async (
    updated: Booking,
    options?: { showLoading?: boolean }
  ) => {
    const showLoading = options?.showLoading ?? false;
    if (showLoading) setServicesSaving(true);
    setSaveError(null);
    try {
      const result = await updateBooking(id, {
        services: updated.services,
        membershipId: updated.membershipId,
        discountPercent: updated.discountPercent,
        discountAmount: updated.discountAmount,
        subtotal: updated.subtotal,
        amount: updated.amount,
      });
      const normalized: Booking = {
        ...result,
        services: (result.services ?? []).map((svc) => ({
          ...svc,
          options: svc.options ?? [],
        })),
      };
      setBooking((prev) => {
        if (!prev) return normalized;
        const stale =
          JSON.stringify(prev.services) !== JSON.stringify(updated.services) ||
          prev.amount !== updated.amount;
        if (stale) return prev;
        return normalized;
      });
      setSavedBooking(normalized);
      return true;
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update booking"
      );
      if (!isManagingServices) {
        setBooking(savedBooking);
      }
      return false;
    } finally {
      if (showLoading) setServicesSaving(false);
    }
  };

  const flushPendingPersist = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const toSave = pendingPersistRef.current;
    if (!toSave) return;
    pendingPersistRef.current = null;
    await persistBookingUpdate(toSave, { showLoading: false });
  };

  const scheduleSilentPersist = (updated: Booking) => {
    pendingPersistRef.current = updated;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      const toSave = pendingPersistRef.current;
      if (!toSave) return;
      pendingPersistRef.current = null;
      persistBookingUpdate(toSave, { showLoading: false });
    }, 450);
  };

  const hasServiceChanges = (current: Booking, saved: Booking) =>
    JSON.stringify(current.services) !== JSON.stringify(saved.services) ||
    current.amount !== saved.amount ||
    current.membershipId !== saved.membershipId ||
    current.discountPercent !== saved.discountPercent ||
    current.discountAmount !== saved.discountAmount ||
    current.subtotal !== saved.subtotal;

  const handleDoneManagingServices = async () => {
    if (hasServiceChanges(booking, savedBooking)) {
      const ok = await persistBookingUpdate(booking, { showLoading: true });
      if (!ok) return;
    }
    setIsManagingServices(false);
    setPosMode("services");
    setActiveServiceIndex(null);
    setServiceSearchQuery("");
  };

  const handleStartManagingServices = async () => {
    await flushPendingPersist();
    setServiceSearchQuery("");
    setIsManagingServices(true);
    setPosMode("services");
  };

  const handleApplyMembership = async () => {
    const trimmed = membershipInput.trim();
    if (!trimmed) {
      setSaveError("Enter a membership ID to apply the discount.");
      return;
    }

    const current = booking.membershipId?.trim() ?? "";
    if (trimmed === current) return;

    if (gymDiscountPercent <= 0) {
      setSaveError("Set gym membership discount % in Company settings first.");
      return;
    }

    await persistMembershipChange(
      applyMembershipDiscountToBooking(
        booking,
        realServices,
        trimmed,
        gymDiscountPercent
      )
    );
  };

  const handleRemoveDiscount = async () => {
    setMembershipInput("");
    await persistMembershipChange(
      applyMembershipDiscountToBooking(booking, realServices, "", 0)
    );
  };

  // Deep compare to detect changes
  const handleSendWhatsAppInvoice = async () => {
    setWhatsappSending(true);
    setSaveError(null);
    setWhatsappSuccess(false);
    try {
      await sendBookingInvoiceWhatsApp(id);
      setWhatsappSuccess(true);
      setTimeout(() => setWhatsappSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to send invoice via WhatsApp"
      );
    } finally {
      setWhatsappSending(false);
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

    const applyToggle = (prev: Booking): Booking => {
      const existingIndex = prev.services.findIndex(
        (s) => s.name === serviceObj.name
      );

      if (existingIndex >= 0) {
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

        return syncBookingDiscount({
          ...prev,
          services: newServices,
        });
      }

      return syncBookingDiscount({
        ...prev,
        services: [...prev.services, { name: serviceObj.name, options: [] }],
      });
    };

    if (isManagingServices) {
      const wasAdding = !booking.services.some(
        (s) => s.name === serviceObj.name
      );
      const next = applyToggle(booking);
      setBooking(next);
      if (wasAdding && (serviceObj.options ?? []).length > 0) {
        const newIndex = next.services.findIndex(
          (s) => s.name === serviceObj.name
        );
        if (newIndex >= 0) {
          configureAddonsFor(newIndex);
        }
      }
      return;
    }

    setBooking((prev) => {
      if (!prev) return prev;
      return applyToggle(prev);
    });
  };

  const configureAddonsFor = (index: number) => {
    setActiveServiceIndex(index);
    setPosMode("options");
  };

  const removeServiceAt = (index: number) => {
    const applyRemove = (prev: Booking): Booking => {
      const newServices = [...prev.services];
      newServices.splice(index, 1);

      if (activeServiceIndex === index) {
        setPosMode("services");
        setActiveServiceIndex(null);
      } else if (activeServiceIndex !== null && activeServiceIndex > index) {
        setActiveServiceIndex(activeServiceIndex - 1);
      }

      return syncBookingDiscount({
        ...prev,
        services: newServices,
      });
    };

    const next = applyRemove(booking);
    setBooking(next);
    if (isManagingServices) {
      return;
    }
    scheduleSilentPersist(next);
  };

  const handlePrintInvoice = () => {
    if (!canPrintInvoice) {
      setSaveError(
        printValidation.message ??
          "Complete all service options before printing the invoice."
      );
      return;
    }
    setShowPrintModal(true);
  };

  const handleStatusChange = (nextStatus: BookingStatus) => {
    setStatusMenuOpen(false);
    if (nextStatus === booking.status) return;

    const previousStatus = booking.status;
    setBooking((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    setSaveError(null);

    updateBooking(id, { status: nextStatus })
      .then((result) => {
        const normalized: Booking = {
          ...result,
          services: (result.services ?? []).map((svc) => ({
            ...svc,
            options: svc.options ?? [],
          })),
        };
        setBooking(normalized);
        setSavedBooking(normalized);
      })
      .catch((err) => {
        setBooking((prev) =>
          prev ? { ...prev, status: previousStatus } : prev
        );
        setSaveError(
          err instanceof Error ? err.message : "Failed to update status"
        );
      });
  };

  const toggleAddon = (addonName: string) => {
    if (activeServiceIndex === null) return;

    const applyToggle = (prev: Booking): Booking => {
      const newServices = [...prev.services];
      const service = { ...newServices[activeServiceIndex]! };
      const hasAddon = service.options?.includes(addonName) ?? false;

      service.options = hasAddon
        ? (service.options || []).filter((a) => a !== addonName)
        : [...(service.options || []), addonName];

      newServices[activeServiceIndex] = service;
      return syncBookingDiscount({
        ...prev,
        services: newServices,
      });
    };

    if (isManagingServices) {
      setBooking((prev) => {
        if (!prev) return prev;
        return applyToggle(prev);
      });
      return;
    }

    setBooking((prev) => {
      if (!prev) return prev;
      return applyToggle(prev);
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
            onClick={() => router.back()}
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
              {getBookingDisplayId(booking)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end md:shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
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
                      onClick={() => handleStatusChange(s)}
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

          {canPrint && (
            <>
              <button
                type="button"
                onClick={handlePrintInvoice}
                disabled={!canPrintInvoice}
                title={
                  !canPrintInvoice
                    ? (printValidation.message ??
                      "Complete service options first")
                    : undefined
                }
                className="bg-primary inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              {booking.phone?.replace(/\D/g, "") && (
                <button
                  type="button"
                  onClick={() => {
                    if (!canPrintInvoice) {
                      setSaveError(
                        printValidation.message ??
                          "Complete all service options before sending the invoice."
                      );
                      return;
                    }
                    handleSendWhatsAppInvoice();
                  }}
                  disabled={whatsappSending || !canPrintInvoice}
                  title={
                    !canPrintInvoice
                      ? (printValidation.message ??
                        "Complete service options first")
                      : undefined
                  }
                  className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  {whatsappSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : whatsappSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {whatsappSending
                      ? "Sending…"
                      : whatsappSuccess
                        ? "Sent!"
                        : "Send"}
                  </span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleDeleteSession}
            className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
                <h3 className="text-primary text-[11px] font-bold tracking-wider uppercase sm:text-xs">
                  Session Services
                </h3>
                {!isCompleted && (
                  <div className="flex items-center gap-2">
                    {isManagingServices &&
                      hasServiceChanges(booking, savedBooking) && (
                        <span className="text-text-secondary text-[10px] font-medium sm:text-xs">
                          Unsaved changes
                        </span>
                      )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isManagingServices) {
                          handleDoneManagingServices();
                        } else {
                          handleStartManagingServices();
                        }
                      }}
                      disabled={servicesSaving}
                      className="border-primary text-primary hover:bg-primary/5 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm"
                    >
                      {servicesSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isManagingServices ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {servicesSaving
                        ? "Saving…"
                        : isManagingServices
                          ? "Done"
                          : "Add service"}
                    </button>
                  </div>
                )}
              </div>
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
                    const optionsTotal = (svc.options ?? []).reduce(
                      (sum, option) => {
                        const matchedAddon = (matchedObj?.options ?? []).find(
                          (a) => a.name === option
                        );
                        return sum + (matchedAddon?.price || 0);
                      },
                      0
                    );
                    const catalogHasOptions =
                      (matchedObj?.options ?? []).length > 0;
                    const missingOptions =
                      catalogHasOptions && (svc.options ?? []).length === 0;
                    return (
                      <div
                        key={svc.name}
                        className={`border-primary/10 rounded-2xl border bg-[#fcf4f0] p-4 sm:p-5 ${
                          missingOptions
                            ? "border-amber-400/60 ring-1 ring-amber-400/30"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <span className="text-primary-dark text-base font-semibold sm:text-lg">
                            {svc.name}
                          </span>
                          {missingOptions && (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Options required
                            </span>
                          )}
                          {!missingOptions &&
                            (svc.options ?? []).length === 0 && (
                              <span className="text-text-secondary shrink-0 text-sm">
                                No options selected
                              </span>
                            )}
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
                                    <span className="text-primary-dark font-medium break-words">
                                      {option}
                                    </span>
                                  </span>
                                  <span className="text-primary-dark shrink-0 font-medium">
                                    {matchedAddon
                                      ? `QAR ${matchedAddon.price}`
                                      : "—"}
                                  </span>
                                </div>
                              );
                            })}
                            <div className="text-text-secondary flex justify-end pt-1 text-xs font-semibold">
                              Subtotal QAR {optionsTotal}
                            </div>
                          </div>
                        )}
                        {isManagingServices && (
                          <div className="border-primary/10 mt-3 flex flex-wrap justify-end gap-2 border-t pt-3">
                            {catalogHasOptions && (
                              <button
                                type="button"
                                onClick={() => configureAddonsFor(idx)}
                                className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                                  activeServiceIndex === idx &&
                                  posMode === "options"
                                    ? "bg-primary text-white"
                                    : "border-primary/20 text-primary hover:bg-primary/5 border bg-white"
                                }`}
                              >
                                {activeServiceIndex === idx &&
                                posMode === "options"
                                  ? "Editing options"
                                  : "Edit options"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeServiceAt(idx)}
                              disabled={servicesSaving}
                              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {!isManagingServices && !isCompleted && (
                          <div className="border-primary/10 mt-3 flex flex-wrap justify-end gap-2 border-t pt-3">
                            {missingOptions && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsManagingServices(true);
                                  configureAddonsFor(idx);
                                }}
                                className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors"
                              >
                                Select options
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeServiceAt(idx)}
                              disabled={servicesSaving}
                              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {isManagingServices && posMode === "services" && (
                <div className="border-primary/10 mt-5 border-t pt-5 sm:mt-6 sm:pt-6">
                  <h4 className="text-primary mb-3 text-[11px] font-bold tracking-wider uppercase sm:mb-4 sm:text-xs">
                    Select a service
                  </h4>
                  <div className="relative mb-4">
                    <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="text"
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      placeholder="Search services or options..."
                      className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-[#fcf4f0] py-2.5 pr-4 pl-9 text-sm transition-colors focus:outline-none"
                    />
                  </div>
                  {servicesLoading ? (
                    <div className="text-text-secondary flex items-center justify-center gap-2 py-8 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading services...
                    </div>
                  ) : servicesError ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {servicesError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      {filteredCatalogServices.map((service) => {
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
                      {filteredCatalogServices.length === 0 && (
                        <div className="text-text-secondary col-span-full rounded-2xl border border-dashed bg-[#fcf4f0] py-8 text-center text-sm">
                          No services match your search.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isManagingServices &&
                posMode === "options" &&
                currentServiceObject &&
                activeService && (
                  <div className="border-primary/10 mt-5 border-t pt-5 sm:mt-6 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setPosMode("services");
                        setActiveServiceIndex(null);
                      }}
                      className="text-primary mb-4 flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to services
                    </button>
                    <h4 className="text-primary-dark mb-1 font-serif text-lg sm:text-xl">
                      {currentServiceObject.name}
                    </h4>
                    <p className="text-text-secondary mb-4 text-sm">
                      Select options for this service.
                    </p>
                    {(currentServiceObject.options ?? []).length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(currentServiceObject.options ?? []).map((option) => {
                          const isSelected = (
                            activeService.options ?? []
                          ).includes(option.name);
                          return (
                            <div
                              key={option.id}
                              onClick={() => toggleAddon(option.name)}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-white shadow-md"
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
                      <div className="border-primary/10 bg-primary/5 rounded-2xl border border-dashed p-8 text-center">
                        <p className="text-primary-dark font-medium">
                          No options available for this service.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              <div className="border-primary/10 mt-5 space-y-4 border-t pt-5 sm:mt-8 sm:pt-6">
                <div>
                  <h4 className="text-primary mb-2 text-[11px] font-bold tracking-wider uppercase sm:text-xs">
                    Gym Membership
                  </h4>
                  {gymDiscountPercent > 0 ? (
                    <p className="text-text-secondary mb-3 text-xs">
                      Discount rate: {gymDiscountPercent}% (from Company
                      settings)
                    </p>
                  ) : (
                    <p className="mb-3 text-xs text-amber-700">
                      Set membership discount % in Company settings to enable.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={membershipInput}
                      onChange={(e) => setMembershipInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyMembership();
                        }
                      }}
                      placeholder="Enter membership ID"
                      disabled={membershipSaving || gymDiscountPercent <= 0}
                      className="border-primary/20 text-primary-dark focus:ring-primary/20 h-11 flex-1 rounded-xl border bg-[#fcf4f0] px-4 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleApplyMembership}
                      disabled={
                        membershipSaving ||
                        gymDiscountPercent <= 0 ||
                        !membershipInput.trim() ||
                        membershipInput.trim() ===
                          (booking.membershipId?.trim() ?? "")
                      }
                      className="bg-primary h-11 shrink-0 rounded-xl px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {membershipSaving ? "Applying…" : "Apply"}
                    </button>
                    {invoiceSummary.hasDiscount && (
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        disabled={membershipSaving}
                        className="border-primary/20 text-primary hover:bg-primary/5 h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        Remove discount
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {invoiceSummary.hasDiscount && (
                    <>
                      <div className="text-text-secondary flex items-center justify-between text-sm">
                        <span>Subtotal</span>
                        <span>QAR {invoiceSummary.subtotal}</span>
                      </div>
                      <div className="text-text-secondary flex items-center justify-between text-sm">
                        <span>
                          Gym discount ({invoiceSummary.discountPercent}%)
                        </span>
                        <span>−QAR {invoiceSummary.discountAmount}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-secondary text-base font-bold sm:text-lg">
                      Total Amount
                    </span>
                    <span className="text-primary-dark text-xl font-bold sm:text-2xl">
                      QAR {invoiceSummary.total}
                    </span>
                  </div>
                </div>
              </div>

              {canPrint && (
                <div className="mt-5 space-y-3 sm:mt-6">
                  {!canPrintInvoice && printValidation.message && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{printValidation.message}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      disabled={!canPrintInvoice}
                      title={
                        !canPrintInvoice
                          ? (printValidation.message ??
                            "Complete service options first")
                          : undefined
                      }
                      className="bg-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Printer className="h-4 w-4" />
                      Print Invoice
                    </button>
                    {booking.phone?.replace(/\D/g, "") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!canPrintInvoice) {
                            setSaveError(
                              printValidation.message ??
                                "Complete all service options before sending the invoice."
                            );
                            return;
                          }
                          handleSendWhatsAppInvoice();
                        }}
                        disabled={whatsappSending || !canPrintInvoice}
                        title={
                          !canPrintInvoice
                            ? (printValidation.message ??
                              "Complete service options first")
                            : undefined
                        }
                        className="border-primary text-primary hover:bg-primary/5 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {whatsappSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : whatsappSuccess ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <MessageCircle className="h-4 w-4" />
                        )}
                        {whatsappSending
                          ? "Sending…"
                          : whatsappSuccess
                            ? "Sent via WhatsApp!"
                            : "Send via WhatsApp"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPrintModal && (
        <PrintModal
          booking={booking}
          lines={invoiceLines}
          summary={invoiceSummary}
          onClose={() => setShowPrintModal(false)}
        />
      )}

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
