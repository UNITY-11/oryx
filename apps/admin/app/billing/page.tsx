"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  MessageCircle,
  Printer,
  Search,
  X,
} from "lucide-react";

import { fetchBookings, updateBooking } from "../../src/features/bookings/api";
import { Booking } from "../../src/features/bookings/mock-data";
import { fetchServices } from "../../src/features/services/api";
import { Service } from "../../src/features/services/mock-data";

type FilterStatus = "All" | "Started" | "Completed";
type BillingBooking = Booking;
// Standard thermal billing machine roll widths
type ThermalSize = "58mm" | "80mm" | "110mm";

function getServiceLineItems(booking: BillingBooking, catalog: Service[]) {
  return booking.services.map((svc) => {
    const obj = catalog.find((r) => r.name === svc.name);
    const base = obj?.pricingTiers?.[0]?.price || 0;
    const addonItems = svc.addons.map((aName) => {
      const a = obj?.addons.find((ad) => ad.name === aName);
      return { name: aName, price: a?.price || 0 };
    });
    return { name: svc.name, base, addons: addonItems };
  });
}

function getTotal(booking: BillingBooking, catalog: Service[]) {
  return getServiceLineItems(booking, catalog).reduce(
    (sum, s) => sum + s.base + s.addons.reduce((a, ad) => a + ad.price, 0),
    0
  );
}

// ─── Invoice HTML builder (prints to hidden iframe) ───────────────────────────
function buildInvoiceHTML(
  booking: BillingBooking,
  lines: ReturnType<typeof getServiceLineItems>,
  total: number,
  thermalSize: ThermalSize
) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // Thermal roll widths: 58mm / 80mm / 110mm, continuous feed (height auto)
  const rollWidth =
    thermalSize === "58mm"
      ? "58mm"
      : thermalSize === "110mm"
        ? "110mm"
        : "80mm";
  const lineItemsHtml = lines
    .map(
      (svc) =>
        `<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;color:#452c1e;">${svc.name}</span>
      <span style="font-weight:600;color:#452c1e;">QAR ${svc.base}</span>
    </div>` +
        svc.addons
          .map(
            (a) =>
              `<div style="display:flex;justify-content:space-between;padding-left:12px;margin-bottom:4px;">
        <span style="font-size:11px;color:#86634f;">↳ ${a.name}</span>
        <span style="font-size:11px;color:#86634f;">+QAR ${a.price}</span>
      </div>`
          )
          .join("")
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${booking.id}</title>
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
      <div class="inv-num">${booking.id}</div>
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
    <div class="row" style="align-items:center;">
      <span class="total-label">Total Due</span>
      <span class="total-val">QAR ${total}</span>
    </div>
    <hr class="dash"/>
    <div class="footer">Thank you for choosing <strong>Oryx Spa</strong> 🌸</div>
  </div>
</body>
</html>`;
}

// ─── Custom Print Modal ────────────────────────────────────────────────────────
// Thermal roll metadata — pixel width used in the live preview
const THERMAL_SIZES: {
  id: ThermalSize;
  label: string;
  desc: string;
  previewPx: number;
}[] = [
  { id: "58mm", label: "58 mm", desc: "Mini / handheld", previewPx: 180 },
  { id: "80mm", label: "80 mm", desc: "Standard POS", previewPx: 248 },
  { id: "110mm", label: "110 mm", desc: "Wide receipt", previewPx: 340 },
];

function PrintModal({
  booking,
  lines,
  total,
  onClose,
}: {
  booking: BillingBooking;
  lines: ReturnType<typeof getServiceLineItems>;
  total: number;
  onClose: () => void;
}) {
  const [thermalSize, setThermalSize] = useState<ThermalSize>("80mm");
  const [printing, setPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedMeta = THERMAL_SIZES.find((s) => s.id === thermalSize)!;

  const handleConfirmPrint = () => {
    setPrinting(true);
    const html = buildInvoiceHTML(booking, lines, total, thermalSize);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setPrinting(false);
    };
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop — brand primary tint */}
      <div
        className="bg-primary/5 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal shell */}
      <div
        className="relative z-10 mx-4 flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] shadow-2xl"
        style={{ maxHeight: "92vh", background: "#fff" }}
      >
        {/* ── Top bar ── */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-2xl">
              <Printer className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-text-primary text-base leading-tight font-bold">
                Print Invoice
              </p>
              <p className="text-text-secondary mt-0.5 font-mono text-xs">
                {booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-primary/10 text-text-secondary hover:text-text-primary hover:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left: settings panel */}
          <div className="border-primary/10 scrollbar-hide flex w-52 shrink-0 flex-col gap-6 overflow-y-auto border-r p-5">
            {/* Roll width */}
            <div>
              <p className="text-text-secondary mb-3 text-[9px] font-bold tracking-widest uppercase">
                Roll Width
              </p>
              <div className="flex flex-col gap-1.5">
                {THERMAL_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setThermalSize(s.id)}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-all ${
                      thermalSize === s.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-primary/5 text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                    }`}
                  >
                    <div>
                      <p className="text-sm leading-tight font-bold">
                        {s.label}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${thermalSize === s.id ? "text-white/70" : "text-text-secondary"}`}
                      >
                        {s.desc}
                      </p>
                    </div>
                    {thermalSize === s.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-primary/10 border-t" />

            {/* Invoice details summary */}
            <div className="space-y-2.5">
              <p className="text-text-secondary text-[9px] font-bold tracking-widest uppercase">
                Details
              </p>
              {[
                { label: "Client", value: booking.customerName },
                { label: "Invoice", value: booking.id },
                { label: "Date", value: currentDate },
                { label: "Total", value: `QAR ${total}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="text-text-secondary shrink-0 text-[11px]">
                    {label}
                  </span>
                  <span className="text-text-primary max-w-[90px] truncate text-right text-[11px] font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live receipt preview — brand primary bg */}
          <div
            className="scrollbar-hide mr-5 flex flex-1 items-start justify-center overflow-y-auto rounded-4xl p-4"
            style={{
              background:
                "linear-gradient(160deg, var(--color-primary) 0%, #ffceb0ff 100%)",
            }}
          >
            {/* Receipt paper card — fixed to selected thermal width */}
            <div
              className="flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{ width: selectedMeta.previewPx }}
            >
              {/* Header strip */}
              <div className="bg-primary/10 border-primary/20 flex flex-col items-center border-b px-4 py-4 text-center">
                <img
                  src="/images/oryx-logo.png"
                  alt="Oryx Spa"
                  className="h-8 w-auto object-contain brightness-75 contrast-125"
                />
                <p className="text-text-secondary mt-1 text-[7px] font-medium tracking-widest uppercase">
                  Luxury Beauty & Wellness
                </p>
                <p className="text-text-secondary mt-1 text-[8px] leading-snug">
                  123 Pearl Blvd, Doha · +974 4444 0000
                </p>
              </div>

              {/* Invoice meta */}
              <div className="border-primary/20 border-b border-dashed px-4 py-3 text-center">
                <p className="text-text-primary text-xs font-bold tracking-widest">
                  INVOICE
                </p>
                <p className="text-text-secondary font-mono text-[9px]">
                  {booking.id}
                </p>
                <p className="text-text-secondary mt-0.5 text-[9px]">
                  {currentDate}
                </p>
                <span className="bg-primary mt-1.5 inline-block rounded-full px-2 py-0.5 text-[7px] font-bold tracking-wider text-white uppercase">
                  {booking.status}
                </span>
              </div>

              {/* Bill to */}
              <div className="border-primary/20 border-b border-dashed px-4 py-3">
                <p className="text-primary mb-1 text-[7px] font-bold tracking-widest uppercase">
                  Billed To
                </p>
                <p className="text-text-primary text-[10px] font-bold">
                  {booking.customerName}
                </p>
                <p className="text-text-secondary text-[8px]">
                  {booking.phone}
                </p>
                <p className="text-text-secondary mt-0.5 text-[8px]">
                  {booking.date} · {booking.time}
                </p>
              </div>

              {/* Line items */}
              <div className="border-primary/20 border-b border-dashed px-4 py-3">
                <div className="text-text-secondary border-primary/20 flex justify-between border-b pb-1.5 text-[7px] font-bold tracking-widest uppercase">
                  <span>Description</span>
                  <span>Amt</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {lines.map((svc, i) => (
                    <div key={i}>
                      <div className="flex justify-between">
                        <span className="text-text-primary text-[9px] leading-tight font-semibold">
                          {svc.name}
                        </span>
                        <span className="text-text-primary ml-1 shrink-0 text-[9px] font-semibold">
                          {svc.base}
                        </span>
                      </div>
                      {svc.addons.map((a, j) => (
                        <div key={j} className="flex justify-between pl-2">
                          <span className="text-text-secondary text-[8px]">
                            ↳ {a.name}
                          </span>
                          <span className="text-text-secondary text-[8px]">
                            +{a.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-primary/20 flex items-center justify-between border-b border-dashed px-4 py-3">
                <span className="text-text-secondary text-[8px] font-bold tracking-widest uppercase">
                  Total Due
                </span>
                <span className="text-text-primary text-sm font-bold">
                  QAR {total}
                </span>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 text-center">
                <p className="text-text-secondary text-[8px] leading-snug">
                  Thank you for choosing
                  <br />
                  <strong>Oryx Spa</strong> 🌸
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer bar ── */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-t bg-white px-7 py-4">
          <p className="text-text-secondary text-xs tabular-nums">
            {selectedMeta.label} roll · {selectedMeta.desc} · 1 page
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-text-secondary bg-primary/10 hover:bg-primary/20 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPrint}
              disabled={printing}
              className="bg-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              {printing ? "Sending…" : "Print Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden iframe for isolated printing */}
      <iframe ref={iframeRef} className="hidden" title="print-frame" />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<BillingBooking | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleComplete = async (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
    );
    try {
      await updateBooking(id, { status: "Completed" });
    } catch {
      // best-effort
    }
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchBookings(), fetchServices()])
      .then(([b, s]) => {
        setBookings(b);
        setServices(s);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const billable = bookings
    .filter((b) => {
      const matchStatus =
        filter === "All"
          ? b.status === "Started" || b.status === "Completed"
          : b.status === filter;
      const matchSearch =
        !search ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (a.status === b.status) return b.date.localeCompare(a.date);
      return a.status === "Started" ? -1 : 1;
    });

  const totalRevenue = bookings
    .filter((b) => b.status === "Started" || b.status === "Completed")
    .reduce((s, b) => s + getTotal(b, services), 0);
  const startedCount = bookings.filter((b) => b.status === "Started").length;
  const completedCount = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const handleWhatsApp = (booking: BillingBooking) => {
    const lines = getServiceLineItems(booking, services);
    const servicesText = lines
      .map((s) => {
        const addonsText = s.addons
          .map((a) => `   ↳ ${a.name}: QAR ${a.price}`)
          .join("\n");
        return `• ${s.name}: QAR ${s.base}${addonsText ? "\n" + addonsText : ""}`;
      })
      .join("\n");
    const total = getTotal(booking, services);
    const bill =
      `*🌿 Oryx Spa — Invoice*\n\n` +
      `Invoice #: ${booking.id}\n` +
      `Date: ${booking.date}  |  Time: ${booking.time}\n` +
      `Client: ${booking.customerName}\n\n` +
      `*Services:*\n${servicesText}\n\n` +
      `*Total: QAR ${total}*\n\n` +
      `Thank you for choosing Oryx Spa! We look forward to seeing you again. 🌸`;
    const phone = booking.phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(bill)}`,
      "_blank"
    );
  };

  const selectedLines = selected ? getServiceLineItems(selected, services) : [];
  const selectedTotal = selected ? getTotal(selected, services) : 0;

  return (
    <>
      {/* Custom Print Modal */}
      {showPrintModal && selected && (
        <PrintModal
          booking={selected}
          lines={selectedLines}
          total={selectedTotal}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      <div className="flex h-full flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="shrink-0 pt-4 pb-4">
          <header className="border-primary/10 z-30 flex h-20 w-full items-center justify-between rounded-3xl border bg-white/90 px-6 shadow-sm backdrop-blur-xl lg:px-10">
            <div className="flex flex-col">
              <h1 className="text-primary-dark font-serif text-2xl font-medium">
                Billing
              </h1>
              <p className="text-text-secondary mt-0.5 text-xs font-medium">
                {startedCount} in session · {completedCount} completed
              </p>
            </div>
            <div className="border-primary/10 hidden w-72 items-center gap-2 rounded-2xl border bg-[#fcf4f0] px-4 py-2.5 md:flex">
              <Search className="text-primary/50 h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Search client or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-primary-dark placeholder:text-text-secondary flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </header>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Summary Cards */}
          <div className="grid shrink-0 grid-cols-3 gap-4">
            {[
              {
                icon: DollarSign,
                label: "Total Billable",
                value: `QAR ${totalRevenue.toLocaleString()}`,
              },
              {
                icon: Clock,
                label: "In Session",
                value: `${startedCount} Active`,
              },
              {
                icon: CheckCircle2,
                label: "Completed",
                value: `${completedCount} Done`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="border-primary/10 flex items-center gap-4 rounded-[28px] border bg-white px-6 py-5 shadow-sm"
              >
                <div className="border-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-[#fcf4f0]">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-text-secondary mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                    {label}
                  </p>
                  <p className="text-primary-dark text-xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Panel */}
          <div className="border-primary/10 overflow-hidden rounded-[32px] border bg-white shadow-sm flex flex-col min-h-0 flex-1">
            <div className="border-primary/5 flex shrink-0 items-center gap-2 border-b p-4 md:px-6">
              {(["All", "Started", "Completed"] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                    filter === f
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "text-text-secondary border-primary/10 hover:border-primary/30 hover:text-primary-dark bg-transparent"
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="text-text-secondary ml-auto text-xs font-medium">
                {billable.length} sessions
              </span>
            </div>

            <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
              {loading ? (
                <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
                  <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
                  <p>Loading sessions...</p>
                </div>
              ) : error ? (
                <div className="flex h-48 flex-col items-center justify-center text-red-500">
                  <AlertCircle className="mb-3 h-8 w-8" />
                  <p>{error}</p>
                </div>
              ) : billable.length === 0 ? (
                <div className="text-text-secondary flex h-48 flex-col items-center justify-center italic">
                  No billable sessions found.
                </div>
              ) : (
                <div className="border-primary/10 overflow-hidden rounded-2xl border">
                  <div className="text-text-secondary border-primary/10 hidden grid-cols-[1.5fr_2fr_100px_100px_180px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase md:grid">
                    <span>Client</span>
                    <span>Services</span>
                    <span className="text-center">Total</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="divide-primary/5 divide-y">
                    {billable.map((booking) => {
                      const total = getTotal(booking, services);
                      const isStarted = booking.status === "Started";
                      
                      return (
                        <div
                          key={booking.id}
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="hover:bg-primary/5 cursor-pointer grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors md:grid-cols-[1.5fr_2fr_100px_100px_180px]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-[#fcf4f0] font-serif text-lg text-primary">
                              {booking.customerName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-primary-dark truncate text-sm font-semibold">
                                {booking.customerName}
                              </span>
                              <span className="text-text-secondary truncate text-xs">
                                {booking.date} · {booking.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <span className="text-text-secondary truncate text-sm">
                              {booking.services.map((s) => s.name).join(", ")}
                            </span>
                          </div>

                          <div className="hidden md:flex justify-center items-center">
                            <span className="text-primary-dark font-bold text-sm">
                              QAR {total}
                            </span>
                          </div>

                          <div className="hidden text-center md:block">
                            <span
                              className={`inline-block shrink-0 text-[10px] font-bold tracking-wider uppercase ${
                                isStarted
                                  ? "text-primary-dark"
                                  : "text-primary"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            {isStarted ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComplete(booking.id);
                                }}
                                className="bg-primary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(booking);
                                    setShowPrintModal(true);
                                  }}
                                  className="border-primary text-primary hover:bg-primary/5 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors"
                                >
                                  <Printer className="h-3 w-3" />
                                  Print
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWhatsApp(booking);
                                  }}
                                  className="bg-primary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  Send
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
