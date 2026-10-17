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

/**
 * Thermal printers only print solid black dots, and the brand logo is light
 * peach, so it fades to nothing on paper. Redraw it as pure black on a
 * transparent background for printing.
 */
const printLogoCache = new Map<string, Promise<string | null>>();

export function loadPrintLogoDataUrl(
  src = "/images/oryx-logo.png"
): Promise<string | null> {
  let cached = printLogoCache.get(src);
  if (!cached) {
    cached = renderPrintLogo(src);
    printLogoCache.set(src, cached);
  }
  return cached;
}

async function renderPrintLogo(src: string): Promise<string | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, 1200 / img.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { width, height } = canvas;
    const image = ctx.getImageData(0, 0, width, height);
    const px = image.data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let i = 0; i < px.length; i += 4) {
      const luminance =
        0.299 * px[i]! + 0.587 * px[i + 1]! + 0.114 * px[i + 2]!;
      const ink = px[i + 3]! > 60 && luminance < 235;
      px[i] = 0;
      px[i + 1] = 0;
      px[i + 2] = 0;
      px[i + 3] = ink ? 255 : 0;
      if (ink) {
        const p = i / 4;
        const x = p % width;
        const y = (p - x) / width;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;
    ctx.putImageData(image, 0, 0);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const out = document.createElement("canvas");
    out.width = cropW;
    out.height = cropH;
    out
      .getContext("2d")
      ?.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return out.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function buildInvoiceHTML(
  booking: BillingBooking,
  lines: ReturnType<typeof getServiceLineItems>,
  summary: InvoiceSummary,
  thermalSize: ThermalSize,
  logoSrc: string | null = "/images/oryx-logo.png"
) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // Use the full roll width for @page so the browser does not scale a
  // narrower layout up to 80mm (that clips the right edge). Keep side
  // padding so content stays inside the thermal head's printable area.
  const rollWidth =
    thermalSize === "58mm"
      ? "58mm"
      : thermalSize === "110mm"
        ? "110mm"
        : "80mm";
  const sidePad =
    thermalSize === "58mm" ? "4mm" : thermalSize === "110mm" ? "3mm" : "5mm";
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
    html, body {
      width: ${rollWidth};
      max-width: ${rollWidth};
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0 ${sidePad};
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.3;
      overflow-x: hidden;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .wrap { width: 100%; max-width: 100%; padding: 2mm 0 5mm; overflow: hidden; }
    .logo { display: block; width: auto; height: auto; max-width: 65%; max-height: 16mm; margin: 0 auto 6px; }
    .center { text-align: center; }
    .brand { font-size: 12px; }
    .addr { font-size: 11px; margin-top: 2px; }
    .title { font-size: 16px; letter-spacing: 1px; }
    .inv-num { font-size: 13px; margin-top: 2px; }
    .meta { font-size: 11px; margin-top: 2px; }
    .status { display: inline-block; margin-top: 4px; padding: 1px 6px; border: 2px solid #000; font-size: 11px; }
    .dash { border: none; border-top: 2px dashed #000; margin: 6px 0; width: 100%; }
    .label { font-size: 11px; margin-bottom: 1px; }
    .val { font-size: 14px; }
    .sub { font-size: 11px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; width: 100%; max-width: 100%; }
    .row > span:first-child { flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; }
    .row > span:last-child { flex: 0 0 auto; max-width: 42%; text-align: right; }
    .th { font-size: 11px; padding-bottom: 3px; border-bottom: 2px solid #000; }
    .items { margin-top: 4px; width: 100%; }
    .item { margin-bottom: 6px; width: 100%; }
    .svc { font-size: 13px; }
    .opt { padding-left: 2px; margin-top: 2px; font-size: 12px; }
    .amt { white-space: nowrap; }
    .total-label { font-size: 13px; }
    .total-val { font-size: 15px; white-space: nowrap; }
    .footer { text-align: center; font-size: 11px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="center">
      ${logoSrc ? `<img src="${logoSrc}" class="logo" alt="Oryx Spa" />` : ""}
      <div class="brand">Luxury Beauty &amp; Wellness</div>
      <div class="addr">Abuhamour, Building no.152, Zone, 56 Street 995, Doha, Qatar<br/>+974 4444 0000</div>
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
