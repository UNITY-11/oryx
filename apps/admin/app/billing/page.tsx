"use client";

import { useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  MessageCircle,
  Printer,
  Search,
  X,
} from "lucide-react";

import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../src/features/services/mock-data";

type FilterStatus = "All" | "Started" | "Completed";
type BillingBooking = (typeof MOCK_BOOKINGS)[0];
// Standard thermal billing machine roll widths
type ThermalSize = "58mm" | "80mm" | "110mm";

function getServiceLineItems(booking: BillingBooking) {
  return booking.services.map((svc) => {
    const obj = REAL_SERVICES.find((r) => r.name === svc.name);
    const base = obj?.pricingTiers?.[0]?.price || 0;
    const addonItems = svc.addons.map((aName) => {
      const a = obj?.addons.find((ad) => ad.name === aName);
      return { name: aName, price: a?.price || 0 };
    });
    return { name: svc.name, base, addons: addonItems };
  });
}

function getTotal(booking: BillingBooking) {
  return getServiceLineItems(booking).reduce(
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<BillingBooking | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const billable = MOCK_BOOKINGS.filter((b) => {
    const matchStatus =
      filter === "All"
        ? b.status === "Started" || b.status === "Completed"
        : b.status === filter;
    const matchSearch =
      !search ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    if (a.status === b.status) return b.date.localeCompare(a.date);
    return a.status === "Started" ? -1 : 1;
  });

  const totalRevenue = MOCK_BOOKINGS.filter(
    (b) => b.status === "Started" || b.status === "Completed"
  ).reduce((s, b) => s + getTotal(b), 0);
  const startedCount = MOCK_BOOKINGS.filter(
    (b) => b.status === "Started"
  ).length;
  const completedCount = MOCK_BOOKINGS.filter(
    (b) => b.status === "Completed"
  ).length;

  const handleWhatsApp = (booking: BillingBooking) => {
    const lines = getServiceLineItems(booking);
    const servicesText = lines
      .map((s) => {
        const addonsText = s.addons
          .map((a) => `   ↳ ${a.name}: QAR ${a.price}`)
          .join("\n");
        return `• ${s.name}: QAR ${s.base}${addonsText ? "\n" + addonsText : ""}`;
      })
      .join("\n");
    const total = getTotal(booking);
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

  const selectedLines = selected ? getServiceLineItems(selected) : [];
  const selectedTotal = selected ? getTotal(selected) : 0;

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
          <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
            {/* ── Left: Session List ── */}
            <div
              className={`border-primary/10 flex flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm transition-all duration-300 ${selected ? "w-[360px] shrink-0" : "flex-1"}`}
            >
              <div className="border-primary/5 flex shrink-0 items-center gap-2 border-b p-4">
                {(["All", "Started", "Completed"] as FilterStatus[]).map(
                  (f) => (
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
                  )
                )}
                <span className="text-text-secondary ml-auto text-xs font-medium">
                  {billable.length} sessions
                </span>
              </div>

              <div className="scrollbar-hide divide-primary/5 flex-1 divide-y overflow-y-auto">
                {billable.length === 0 ? (
                  <div className="text-text-secondary py-20 text-center text-sm italic">
                    No billable sessions found.
                  </div>
                ) : (
                  billable.map((booking) => {
                    const total = getTotal(booking);
                    const isStarted = booking.status === "Started";
                    const isActive = selected?.id === booking.id;
                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelected(booking)}
                        className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-all ${
                          isActive
                            ? "bg-primary/5 border-l-primary border-l-4"
                            : "border-l-4 border-l-transparent hover:bg-[#fcf4f0]/60"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-serif text-lg ${
                            isActive
                              ? "bg-primary/10 border-primary/20 text-primary"
                              : "border-primary/10 text-primary bg-[#fcf4f0]"
                          }`}
                        >
                          {booking.customerName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-primary-dark truncate text-sm font-bold">
                              {booking.customerName}
                            </p>
                            <p className="text-primary-dark shrink-0 text-sm font-bold">
                              QAR {total}
                            </p>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="text-text-secondary truncate text-xs">
                              {booking.date} · {booking.time}
                            </p>
                            <span
                              className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                isStarted
                                  ? "bg-primary-dark text-white"
                                  : "bg-primary text-white"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          {!selected && (
                            <p className="text-text-secondary mt-0.5 truncate text-xs">
                              {booking.services.map((s) => s.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-primary/20 group-hover:text-primary/50"}`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Right: Invoice Panel ── */}
            {selected && (
              <div className="animate-in slide-in-from-right-4 flex min-h-0 flex-1 flex-col duration-200">
                {/* Toolbar */}
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <p className="text-text-secondary pl-1 text-sm font-semibold">
                    Invoice preview
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                    <button
                      onClick={() => handleWhatsApp(selected)}
                      className="bg-primary flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="border-primary/10 text-text-secondary hover:text-primary-dark hover:bg-primary/5 flex h-9 w-9 items-center justify-center rounded-xl border bg-white transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Invoice card */}
                <div className="scrollbar-hide flex-1 overflow-y-auto">
                  <div className="border-primary/10 mx-auto w-full max-w-2xl overflow-hidden rounded-[32px] border bg-white shadow-sm">
                    <div className="border-primary/10 flex items-start justify-between border-b bg-[#fcf4f0] px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <img
                          src="/images/oryx-logo.png"
                          alt="Oryx Spa"
                          className="h-14 w-auto object-contain brightness-75 contrast-125"
                        />
                        <p className="text-text-secondary mt-1 text-[10px] font-medium tracking-widest uppercase">
                          Luxury Beauty & Wellness
                        </p>
                        <div className="text-text-secondary mt-2 space-y-0.5 text-xs leading-relaxed">
                          <p>123 Pearl Boulevard, Doha, Qatar</p>
                          <p>+974 4444 0000 · CR: 123456789</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-dark font-serif text-3xl font-bold tracking-wide">
                          INVOICE
                        </p>
                        <p className="text-text-secondary mt-1 font-mono text-xs">
                          {selected.id}
                        </p>
                        <p className="text-text-secondary mt-2 text-xs">
                          {new Date().toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <span
                          className={`mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${selected.status === "Started" ? "bg-primary-dark text-white" : "bg-primary text-white"}`}
                        >
                          {selected.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-8 px-10 py-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-primary mb-2 text-[10px] font-bold tracking-widest uppercase">
                            Billed To
                          </p>
                          <p className="text-primary-dark text-base font-bold">
                            {selected.customerName}
                          </p>
                          <p className="text-text-secondary mt-0.5 text-sm">
                            {selected.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary mb-2 text-[10px] font-bold tracking-widest uppercase">
                            Session
                          </p>
                          <p className="text-primary-dark text-sm font-semibold">
                            {selected.date}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {selected.time}
                          </p>
                        </div>
                      </div>
                      <div className="border-primary/20 border-t border-dashed" />
                      <div>
                        <div className="text-text-secondary border-primary/10 grid grid-cols-[1fr_auto] border-b pb-3 text-[10px] font-bold tracking-widest uppercase">
                          <span>Description</span>
                          <span className="text-right">Amount</span>
                        </div>
                        <div className="mt-4 space-y-4">
                          {selectedLines.map((svc, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between">
                                <span className="text-primary-dark font-semibold">
                                  {svc.name}
                                </span>
                                <span className="text-primary-dark font-semibold">
                                  QAR {svc.base}
                                </span>
                              </div>
                              {svc.addons.map((a, j) => (
                                <div
                                  key={j}
                                  className="mt-1.5 flex items-center justify-between pl-5"
                                >
                                  <span className="text-text-secondary flex items-center gap-1 text-xs">
                                    <ChevronRight className="text-primary/30 h-3 w-3" />{" "}
                                    {a.name}
                                  </span>
                                  <span className="text-text-secondary text-xs">
                                    + QAR {a.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-primary/20 border-t border-dashed" />
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm font-bold tracking-widest uppercase">
                          Total Due
                        </span>
                        <span className="text-primary-dark font-serif text-3xl font-bold">
                          QAR {selectedTotal}
                        </span>
                      </div>
                      <div className="border-primary/10 rounded-2xl border bg-[#fcf4f0] px-6 py-4 text-center">
                        <p className="text-text-secondary text-xs leading-relaxed">
                          Thank you for choosing{" "}
                          <span className="text-primary-dark font-semibold">
                            Oryx Spa
                          </span>
                          . We look forward to welcoming you again. 🌸
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
