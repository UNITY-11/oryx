import { useCallback, useEffect, useState } from "react";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";
import {
  formatInvoiceMessage,
  openWhatsAppChat,
  toBookingWhatsAppPayload,
  type CompanyWhatsAppContext,
} from "@repo/whatsapp";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import {
  fetchBookings,
  fetchBookingsPage,
  updateBooking,
} from "../../bookings/api";
import { Booking, getBookingDisplayId } from "../../bookings/types";
import { fetchServices } from "../../services/api";
import { Service } from "../../services/types";
import {
  getInvoiceTotal,
  getServiceLineItems,
  type InvoiceLineItem,
} from "../invoice-lines";
import { getInvoiceSummary, type InvoiceSummary } from "../invoice-summary";

export type FilterStatus = "All" | "Confirmed" | "Completed";
export type BillingBooking = Booking;
export type ThermalSize = "58mm" | "80mm" | "110mm";

export { getInvoiceTotal, getServiceLineItems, type InvoiceLineItem };
export { getInvoiceSummary } from "../invoice-summary";

export function getTotal(booking: BillingBooking, catalog: Service[]) {
  return getInvoiceTotal(booking, catalog);
}

export function openWhatsAppInvoice(
  booking: BillingBooking,
  catalog: Service[],
  company?: CompanyWhatsAppContext
) {
  const lines = getServiceLineItems(booking, catalog);
  const summary = getInvoiceSummary(booking, catalog);
  const message = formatInvoiceMessage(
    toBookingWhatsAppPayload(booking),
    lines,
    summary,
    company
  );
  openWhatsAppChat(booking.phone, message);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoiceHTML(
  booking: BillingBooking,
  lines: ReturnType<typeof getServiceLineItems>,
  summary: InvoiceSummary,
  thermalSize: ThermalSize
) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const rollWidth =
    thermalSize === "58mm"
      ? "58mm"
      : thermalSize === "110mm"
        ? "110mm"
        : "80mm";
  // Thermal heads can't print the full roll width; sizing content to the
  // printable area avoids the driver shrinking (and blurring) the page.
  const printableWidth =
    thermalSize === "58mm"
      ? "48mm"
      : thermalSize === "110mm"
        ? "104mm"
        : "72mm";
  const lineItemsHtml = lines
    .map((svc) => {
      const header = `<div class="svc">${escapeHtml(svc.name)}</div>`;
      if (svc.options.length === 0) return `<div class="item">${header}</div>`;
      const optionsHtml = svc.options
        .map(
          (a) =>
            `<div class="row opt"><span class="opt-name">${escapeHtml(a.name)}</span><span class="amt">QAR ${a.price}</span></div>`
        )
        .join("");
      return `<div class="item">${header}${optionsHtml}</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${getBookingDisplayId(booking)}</title>
  <style>
    @page { size: ${rollWidth} auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; color: #000; }
    html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      width: ${printableWidth};
      margin: 0 auto;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.35;
      -webkit-font-smoothing: none;
      text-rendering: optimizeLegibility;
    }
    .wrap { padding: 2mm 0 4mm; }
    .logo { height: 40px; max-width: 100%; object-fit: contain; display: block; margin: 0 auto 4px; filter: grayscale(1) contrast(2); }
    .center { text-align: center; }
    .brand { font-size: 12px; font-weight: 700; }
    .addr { font-size: 11px; margin-top: 2px; }
    .title { font-size: 16px; font-weight: 700; }
    .inv-num { font-size: 12px; font-weight: 700; margin-top: 2px; }
    .meta { font-size: 11px; margin-top: 2px; }
    .status { display: inline-block; margin-top: 4px; padding: 1px 6px; border: 1px solid #000; font-size: 11px; font-weight: 700; }
    .dash { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .label { font-size: 11px; font-weight: 700; margin-bottom: 1px; }
    .val { font-size: 13px; font-weight: 700; }
    .sub { font-size: 11px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
    .th { font-size: 11px; font-weight: 700; padding-bottom: 3px; border-bottom: 1px solid #000; }
    .items { margin-top: 4px; }
    .item { margin-bottom: 6px; }
    .svc { font-size: 12px; font-weight: 700; }
    .opt { padding-left: 6px; margin-top: 2px; font-size: 12px; }
    .opt-name { flex: 1; min-width: 0; word-break: break-word; }
    .amt { white-space: nowrap; font-weight: 700; }
    .total-label { font-size: 13px; font-weight: 700; }
    .total-val { font-size: 18px; font-weight: 700; white-space: nowrap; }
    .footer { text-align: center; font-size: 11px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="center">
      <img src="/images/oryx-logo.png" class="logo" alt="Oryx Spa" />
      <div class="brand">Luxury Beauty &amp; Wellness</div>
      <div class="addr">123 Pearl Boulevard, Doha, Qatar<br/>+974 4444 0000</div>
    </div>
    <hr class="dash"/>
    <div class="center">
      <div class="title">INVOICE</div>
      <div class="inv-num">${escapeHtml(getBookingDisplayId(booking))}</div>
      <div class="meta">${date}</div>
      <span class="status">${escapeHtml(booking.status)}</span>
    </div>
    <hr class="dash"/>
    <div class="label">Billed To</div>
    <div class="val">${escapeHtml(booking.customerName)}</div>
    <div class="sub">${escapeHtml(booking.phone)}</div>
    <div class="sub" style="margin-top:2px;">${escapeHtml(booking.date)} | ${escapeHtml(booking.time)}</div>
    <hr class="dash"/>
    <div class="row th"><span>Description</span><span>Amount</span></div>
    <div class="items">${lineItemsHtml}</div>
    <hr class="dash"/>
    ${summary.hasDiscount ? `<div class="row sub"><span>Subtotal</span><span class="amt">QAR ${summary.subtotal}</span></div><div class="row sub" style="margin-top:2px;"><span>Gym discount (${summary.discountPercent}%)</span><span class="amt">-QAR ${summary.discountAmount}</span></div><div class="sub" style="text-align:right;margin:2px 0 4px;">Membership: ${escapeHtml(summary.membershipId ?? "")}</div>` : ""}
    <div class="row">
      <span class="total-label">Total Due</span>
      <span class="total-val">QAR ${summary.total}</span>
    </div>
    <hr class="dash"/>
    <div class="footer">Thank you for choosing <strong>Oryx Spa</strong></div>
  </div>
</body>
</html>`;
}

export function useBillingData() {
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<BillingBooking | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchPage = useCallback(
    (params: { q: string; page: number; pageSize: number }) =>
      fetchBookingsPage({
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        status: filter,
        billable: true,
      }),
    [filter]
  );

  const list = usePaginatedList(fetchPage, {
    extraParams: { status: filter, billable: "1" },
    extraDeps: [filter],
  });

  const reloadStats = useCallback(() => {
    setStatsLoading(true);
    setStatsError(null);
    Promise.all([fetchBookings(), fetchServices()])
      .then(([b, s]) => {
        setBookings(b);
        setServices(s);
      })
      .catch((err) =>
        setStatsError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  useSanityListener('*[_type == "booking"]', () => {
    reloadStats();
    list.reload();
  });

  const handleComplete = async (id: string) => {
    list.setItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
    );
    try {
      await updateBooking(id, { status: "Completed" });
      list.reload();
      reloadStats();
    } catch {
      // best-effort
    }
  };

  const handleWhatsApp = (booking: BillingBooking) => {
    openWhatsAppInvoice(booking, services);
  };

  const totalRevenue = bookings
    .filter(
      (b) =>
        b.status === "Confirmed" ||
        b.status === "Completed" ||
        b.status === "Started"
    )
    .reduce((s, b) => s + getInvoiceSummary(b, services).total, 0);
  const confirmedCount =
    list.meta?.confirmedCount ??
    bookings.filter((b) => b.status === "Confirmed" || b.status === "Started")
      .length;
  const completedCount =
    list.meta?.completedCount ??
    bookings.filter((b) => b.status === "Completed").length;

  const selectedLines = selected ? getServiceLineItems(selected, services) : [];
  const selectedSummary = selected
    ? getInvoiceSummary(selected, services)
    : {
        subtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        total: 0,
        hasDiscount: false,
      };

  return {
    search: list.searchQuery,
    setSearch: list.setSearchQuery,
    filter,
    setFilter,
    selected,
    setSelected,
    showPrintModal,
    setShowPrintModal,
    bookings,
    services,
    loading: list.loading || statsLoading,
    error: list.error || statsError,
    handleComplete,
    handleWhatsApp,
    billable: list.items,
    page: list.page,
    setPage: list.setPage,
    totalPages: list.totalPages,
    totalItems: list.totalItems,
    from: list.from,
    to: list.to,
    hasPrev: list.hasPrev,
    hasNext: list.hasNext,
    totalRevenue,
    confirmedCount,
    completedCount,
    selectedLines,
    selectedSummary,
  };
}
