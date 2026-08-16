import { useCallback, useEffect, useState } from "react";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";
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

export type FilterStatus = "All" | "Started" | "Completed";
export type BillingBooking = Booking;
export type ThermalSize = "58mm" | "80mm" | "110mm";

export { getInvoiceTotal, getServiceLineItems, type InvoiceLineItem };
export { getInvoiceSummary } from "../invoice-summary";

export function getTotal(booking: BillingBooking, catalog: Service[]) {
  return getInvoiceTotal(booking, catalog);
}

export function openWhatsAppInvoice(
  booking: BillingBooking,
  catalog: Service[]
) {
  const lines = getServiceLineItems(booking, catalog);
  const servicesText = lines
    .map((s) => {
      if (s.options.length > 0) {
        const optionsText = s.options
          .map((a) => `• ${a.name}: QAR ${a.price}`)
          .join("\n");
        return `*${s.name}*\n${optionsText}`;
      }
      return `• ${s.name}`;
    })
    .join("\n\n");
  const total = getTotal(booking, catalog);
  const bill =
    `*🌿 Oryx Spa — Invoice*\n\n` +
    `Invoice #: ${getBookingDisplayId(booking)}\n` +
    `Date: ${booking.date}  |  Time: ${booking.time}\n` +
    `Client: ${booking.customerName}\n\n` +
    `*Services:*\n${servicesText}\n\n` +
    `*Total: QAR ${total}*\n\n` +
    `Thank you for choosing Oryx Spa! We look forward to seeing you again. 🌸`;
  const phone = booking.phone.replace(/\D/g, "");
  if (!phone) return;
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(bill)}`,
    "_blank"
  );
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
  const lineItemsHtml = lines
    .map((svc) => {
      const categoryHeader = `<div style="margin-bottom:4px;">
      <span style="font-weight:700;color:#452c1e;font-size:11px;">${svc.name}</span>
    </div>`;
      if (svc.options.length === 0) {
        return categoryHeader;
      }
      const optionsHtml = svc.options
        .map(
          (a) =>
            `<div style="display:flex;justify-content:space-between;padding-left:8px;margin-bottom:4px;">
        <span style="font-size:11px;color:#452c1e;">${a.name}</span>
        <span style="font-size:11px;font-weight:600;color:#452c1e;">QAR ${a.price}</span>
      </div>`
        )
        .join("");
      return `<div style="margin-bottom:8px;">${categoryHeader}${optionsHtml}</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${getBookingDisplayId(booking)}</title>
  <style>
    @page { size: ${rollWidth} auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, "Inter", sans-serif; background: white; width: ${rollWidth}; }
    .wrap { padding: 12px; }
    .logo { height: 36px; object-fit: contain; filter: brightness(0.75) contrast(1.25); display: block; margin: 0 auto 4px; }
    .center { text-align: center; }
    .brand { font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; color: #86634f; }
    .addr { font-size: 9px; color: #86634f; line-height: 1.5; margin-top: 4px; }
    .inv-num { font-size: 10px; font-family: monospace; color: #86634f; margin-top: 2px; }
    .dash { border: none; border-top: 1px dashed #cf8563; margin: 8px 0; }
    .label { font-size: 8px; font-weight: 700; color: #cf8563; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2px; }
    .val { font-size: 11px; font-weight: 700; color: #452c1e; }
    .sub { font-size: 9px; color: #86634f; }
    .row { display: flex; justify-content: space-between; }
    .th { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #86634f; padding-bottom: 4px; border-bottom: 1px solid #cf8563; }
    .total-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #86634f; }
    .total-val { font-size: 18px; font-weight: 700; color: #452c1e; }
    .footer { text-align: center; font-size: 9px; color: #86634f; margin-top: 8px; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: #cf8563; color: white; }
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
      <div style="font-size:13px;font-weight:700;color:#452c1e;">INVOICE</div>
      <div class="inv-num">${getBookingDisplayId(booking)}</div>
      <div style="font-size:9px;color:#86634f;margin-top:2px;">${date}</div>
      <span class="pill" style="margin-top:4px;display:inline-block;">${booking.status}</span>
    </div>
    <hr class="dash"/>
    <div class="label">Billed To</div>
    <div class="val">${booking.customerName}</div>
    <div class="sub">${booking.phone}</div>
    <div style="margin-top:4px;" class="sub">${booking.date} · ${booking.time}</div>
    <hr class="dash"/>
    <div class="row th"><span>Description</span><span>Amount</span></div>
    <div style="margin-top:6px;">${lineItemsHtml}</div>
    <hr class="dash"/>
    ${summary.hasDiscount ? `<div class="row" style="margin-bottom:4px;"><span class="sub">Subtotal</span><span class="sub" style="font-weight:600;">QAR ${summary.subtotal}</span></div><div class="row" style="margin-bottom:4px;"><span class="sub">Gym discount (${summary.discountPercent}%)</span><span class="sub" style="font-weight:600;">−QAR ${summary.discountAmount}</span></div><div class="sub" style="text-align:right;margin-bottom:4px;">Membership: ${summary.membershipId ?? ""}</div>` : ""}
    <div class="row" style="align-items:center;">
      <span class="total-label">Total Due</span>
      <span class="total-val">QAR ${summary.total}</span>
    </div>
    <hr class="dash"/>
    <div class="footer">Thank you for choosing <strong>Oryx Spa</strong> 🌸</div>
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
    .filter((b) => b.status === "Started" || b.status === "Completed")
    .reduce((s, b) => s + getInvoiceSummary(b, services).total, 0);
  const startedCount =
    list.meta?.startedCount ??
    bookings.filter((b) => b.status === "Started").length;
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
    startedCount,
    completedCount,
    selectedLines,
    selectedSummary,
  };
}
