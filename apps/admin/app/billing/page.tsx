"use client";

import { useState, useRef } from "react";
import {
  Search, Clock, CheckCircle2,
  Printer, MessageCircle, X, ChevronRight, DollarSign, Check
} from "lucide-react";
import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../src/features/services/mock-data";

type FilterStatus = "All" | "Started" | "Completed";
type BillingBooking = typeof MOCK_BOOKINGS[0];
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
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  // Thermal roll widths: 58mm / 80mm / 110mm, continuous feed (height auto)
  const rollWidth = thermalSize === "58mm" ? "58mm" : thermalSize === "110mm" ? "110mm" : "80mm";
  const lineItemsHtml = lines.map((svc) =>
    `<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;color:#4a3018;">${svc.name}</span>
      <span style="font-weight:600;color:#4a3018;">QAR ${svc.base}</span>
    </div>` +
    svc.addons.map((a) =>
      `<div style="display:flex;justify-content:space-between;padding-left:12px;margin-bottom:4px;">
        <span style="font-size:11px;color:#8a6c57;">↳ ${a.name}</span>
        <span style="font-size:11px;color:#8a6c57;">+QAR ${a.price}</span>
      </div>`
    ).join("")
  ).join("");

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
    .brand { font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; color: #8a6c57; }
    .addr { font-size: 9px; color: #8a6c57; line-height: 1.5; margin-top: 4px; }
    .inv-num { font-size: 10px; font-family: monospace; color: #8a6c57; margin-top: 2px; }
    .dash { border: none; border-top: 1px dashed #eabda7; margin: 8px 0; }
    .label { font-size: 8px; font-weight: 700; color: #eabda7; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2px; }
    .val { font-size: 11px; font-weight: 700; color: #4a3018; }
    .sub { font-size: 9px; color: #8a6c57; }
    .row { display: flex; justify-content: space-between; }
    .th { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8a6c57; padding-bottom: 4px; border-bottom: 1px solid #eabda7; }
    .total-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #8a6c57; }
    .total-val { font-size: 18px; font-weight: 700; color: #4a3018; }
    .footer { text-align: center; font-size: 9px; color: #8a6c57; margin-top: 8px; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: #eabda7; color: white; }
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
      <div style="font-size:13px;font-weight:700;color:#4a3018;">INVOICE</div>
      <div class="inv-num">${booking.id}</div>
      <div style="font-size:9px;color:#8a6c57;margin-top:2px;">${date}</div>
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
const THERMAL_SIZES: { id: ThermalSize; label: string; desc: string; previewPx: number }[] = [
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

  const currentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop — brand primary tint */}
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" onClick={onClose} />

      {/* Modal shell */}
      <div
        className="relative z-10 w-full max-w-4xl mx-4 rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: "92vh", background: "#fff" }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-base leading-tight">Print Invoice</p>
              <p className="text-xs text-text-secondary font-mono mt-0.5">{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-primary/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left: settings panel */}
          <div className="w-52 shrink-0 border-r border-primary/10 flex flex-col p-5 gap-6 overflow-y-auto scrollbar-hide">

            {/* Roll width */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-3">Roll Width</p>
              <div className="flex flex-col gap-1.5">
                {THERMAL_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setThermalSize(s.id)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all ${thermalSize === s.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-primary/5 text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                      }`}
                  >
                    <div>
                      <p className="text-sm font-bold leading-tight">{s.label}</p>
                      <p className={`text-[10px] mt-0.5 ${thermalSize === s.id ? "text-white/70" : "text-text-secondary"}`}>{s.desc}</p>
                    </div>
                    {thermalSize === s.id && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-primary/10" />

            {/* Invoice details summary */}
            <div className="space-y-2.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Details</p>
              {[
                { label: "Client", value: booking.customerName },
                { label: "Invoice", value: booking.id },
                { label: "Date", value: currentDate },
                { label: "Total", value: `QAR ${total}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-[11px] text-text-secondary shrink-0">{label}</span>
                  <span className="text-[11px] font-semibold text-text-primary text-right truncate max-w-[90px]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live receipt preview — brand primary bg */}
          <div
            className="flex-1 overflow-y-auto scrollbar-hide flex items-start justify-center p-4 rounded-4xl mr-5"
            style={{ background: "linear-gradient(160deg, var(--color-primary) 0%, #ffceb0ff 100%)" }}
          >
            {/* Receipt paper card — fixed to selected thermal width */}
            <div
              className="bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300"
              style={{ width: selectedMeta.previewPx }}
            >
              {/* Header strip */}
              <div className="bg-primary/10 px-4 py-4 flex flex-col items-center border-b border-primary/20 text-center">
                <img src="/images/oryx-logo.png" alt="Oryx Spa" className="h-8 w-auto object-contain brightness-75 contrast-125" />
                <p className="text-[7px] tracking-widest text-text-secondary uppercase font-medium mt-1">Luxury Beauty & Wellness</p>
                <p className="text-[8px] text-text-secondary mt-1 leading-snug">123 Pearl Blvd, Doha · +974 4444 0000</p>
              </div>

              {/* Invoice meta */}
              <div className="px-4 py-3 text-center border-b border-dashed border-primary/20">
                <p className="text-xs font-bold text-text-primary tracking-widest">INVOICE</p>
                <p className="text-[9px] font-mono text-text-secondary">{booking.id}</p>
                <p className="text-[9px] text-text-secondary mt-0.5">{currentDate}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider bg-primary text-white">
                  {booking.status}
                </span>
              </div>

              {/* Bill to */}
              <div className="px-4 py-3 border-b border-dashed border-primary/20">
                <p className="text-[7px] font-bold uppercase tracking-widest text-primary mb-1">Billed To</p>
                <p className="text-[10px] font-bold text-text-primary">{booking.customerName}</p>
                <p className="text-[8px] text-text-secondary">{booking.phone}</p>
                <p className="text-[8px] text-text-secondary mt-0.5">{booking.date} · {booking.time}</p>
              </div>

              {/* Line items */}
              <div className="px-4 py-3 border-b border-dashed border-primary/20">
                <div className="flex justify-between text-[7px] font-bold uppercase tracking-widest text-text-secondary pb-1.5 border-b border-primary/20">
                  <span>Description</span><span>Amt</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {lines.map((svc, i) => (
                    <div key={i}>
                      <div className="flex justify-between">
                        <span className="text-[9px] font-semibold text-text-primary leading-tight">{svc.name}</span>
                        <span className="text-[9px] font-semibold text-text-primary shrink-0 ml-1">{svc.base}</span>
                      </div>
                      {svc.addons.map((a, j) => (
                        <div key={j} className="flex justify-between pl-2">
                          <span className="text-[8px] text-text-secondary">↳ {a.name}</span>
                          <span className="text-[8px] text-text-secondary">+{a.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="px-4 py-3 flex justify-between items-center border-b border-dashed border-primary/20">
                <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Total Due</span>
                <span className="text-sm font-bold text-text-primary">QAR {total}</span>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 text-center">
                <p className="text-[8px] text-text-secondary leading-snug">Thank you for choosing<br /><strong>Oryx Spa</strong> 🌸</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer bar ── */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-primary/10 bg-white shrink-0">
          <p className="text-xs text-text-secondary tabular-nums">
            {selectedMeta.label} roll · {selectedMeta.desc} · 1 page
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPrint}
              disabled={printing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
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

  const totalRevenue = MOCK_BOOKINGS
    .filter((b) => b.status === "Started" || b.status === "Completed")
    .reduce((s, b) => s + getTotal(b), 0);
  const startedCount = MOCK_BOOKINGS.filter((b) => b.status === "Started").length;
  const completedCount = MOCK_BOOKINGS.filter((b) => b.status === "Completed").length;

  const handleWhatsApp = (booking: BillingBooking) => {
    const lines = getServiceLineItems(booking);
    const servicesText = lines
      .map((s) => {
        const addonsText = s.addons.map((a) => `   ↳ ${a.name}: QAR ${a.price}`).join("\n");
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
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(bill)}`, "_blank");
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

      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Header ── */}
        <div className="shrink-0 pt-4 pb-4">
          <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 z-30">
            <div className="flex flex-col">
              <h1 className="font-serif text-2xl font-medium text-primary-dark">Billing</h1>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                {startedCount} in session · {completedCount} completed
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#fcf4f0] border border-primary/10 rounded-2xl px-4 py-2.5 w-72">
              <Search className="w-4 h-4 text-primary/50 shrink-0" />
              <input
                type="text"
                placeholder="Search client or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-primary-dark placeholder:text-text-secondary outline-none flex-1"
              />
            </div>
          </header>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-col gap-4">

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {[
              { icon: DollarSign, label: "Total Billable", value: `QAR ${totalRevenue.toLocaleString()}` },
              { icon: Clock, label: "In Session", value: `${startedCount} Active` },
              { icon: CheckCircle2, label: "Completed", value: `${completedCount} Done` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-[28px] border border-primary/10 shadow-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-0.5">{label}</p>
                  <p className="text-xl font-bold text-primary-dark">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Panel */}
          <div className="flex-1 overflow-hidden flex gap-4 min-h-0">

            {/* ── Left: Session List ── */}
            <div className={`flex flex-col bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden transition-all duration-300 ${selected ? "w-[360px] shrink-0" : "flex-1"}`}>
              <div className="flex items-center gap-2 p-4 border-b border-primary/5 shrink-0">
                {(["All", "Started", "Completed"] as FilterStatus[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${filter === f
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-transparent text-text-secondary border-primary/10 hover:border-primary/30 hover:text-primary-dark"
                      }`}
                  >
                    {f}
                  </button>
                ))}
                <span className="ml-auto text-xs text-text-secondary font-medium">{billable.length} sessions</span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-primary/5">
                {billable.length === 0 ? (
                  <div className="py-20 text-center text-text-secondary italic text-sm">No billable sessions found.</div>
                ) : (
                  billable.map((booking) => {
                    const total = getTotal(booking);
                    const isStarted = booking.status === "Started";
                    const isActive = selected?.id === booking.id;
                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelected(booking)}
                        className={`w-full flex items-center gap-4 px-5 py-4 transition-all text-left group ${isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-[#fcf4f0]/60 border-l-4 border-l-transparent"
                          }`}
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-serif shrink-0 border ${isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-[#fcf4f0] border-primary/10 text-primary"
                          }`}>
                          {booking.customerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-primary-dark text-sm truncate">{booking.customerName}</p>
                            <p className="font-bold text-primary-dark text-sm shrink-0">QAR {total}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-text-secondary truncate">{booking.date} · {booking.time}</p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${isStarted ? "bg-primary-dark text-white" : "bg-primary text-white"
                              }`}>
                              {booking.status}
                            </span>
                          </div>
                          {!selected && (
                            <p className="text-xs text-text-secondary mt-0.5 truncate">
                              {booking.services.map((s) => s.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-primary/20 group-hover:text-primary/50"}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Right: Invoice Panel ── */}
            {selected && (
              <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-200">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <p className="text-sm font-semibold text-text-secondary pl-1">Invoice preview</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={() => handleWhatsApp(selected)}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-9 h-9 rounded-xl bg-white border border-primary/10 flex items-center justify-center text-text-secondary hover:text-primary-dark hover:bg-primary/5 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Invoice card */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden w-full max-w-2xl mx-auto">
                    <div className="bg-[#fcf4f0] px-10 py-8 flex items-start justify-between border-b border-primary/10">
                      <div className="flex flex-col gap-1">
                        <img src="/images/oryx-logo.png" alt="Oryx Spa" className="h-14 w-auto object-contain brightness-75 contrast-125" />
                        <p className="text-[10px] tracking-widest text-text-secondary uppercase font-medium mt-1">Luxury Beauty & Wellness</p>
                        <div className="text-xs text-text-secondary mt-2 space-y-0.5 leading-relaxed">
                          <p>123 Pearl Boulevard, Doha, Qatar</p>
                          <p>+974 4444 0000 · CR: 123456789</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-serif font-bold text-primary-dark tracking-wide">INVOICE</p>
                        <p className="text-xs font-mono text-text-secondary mt-1">{selected.id}</p>
                        <p className="text-xs text-text-secondary mt-2">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selected.status === "Started" ? "bg-primary-dark text-white" : "bg-primary text-white"}`}>
                          {selected.status}
                        </span>
                      </div>
                    </div>

                    <div className="px-10 py-8 space-y-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Billed To</p>
                          <p className="font-bold text-primary-dark text-base">{selected.customerName}</p>
                          <p className="text-sm text-text-secondary mt-0.5">{selected.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Session</p>
                          <p className="text-sm text-primary-dark font-semibold">{selected.date}</p>
                          <p className="text-sm text-text-secondary">{selected.time}</p>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-primary/20" />
                      <div>
                        <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-widest text-text-secondary pb-3 border-b border-primary/10">
                          <span>Description</span>
                          <span className="text-right">Amount</span>
                        </div>
                        <div className="space-y-4 mt-4">
                          {selectedLines.map((svc, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-primary-dark">{svc.name}</span>
                                <span className="font-semibold text-primary-dark">QAR {svc.base}</span>
                              </div>
                              {svc.addons.map((a, j) => (
                                <div key={j} className="flex justify-between items-center mt-1.5 pl-5">
                                  <span className="text-xs text-text-secondary flex items-center gap-1">
                                    <ChevronRight className="w-3 h-3 text-primary/30" /> {a.name}
                                  </span>
                                  <span className="text-xs text-text-secondary">+ QAR {a.price}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-dashed border-primary/20" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Total Due</span>
                        <span className="text-3xl font-serif font-bold text-primary-dark">QAR {selectedTotal}</span>
                      </div>
                      <div className="bg-[#fcf4f0] rounded-2xl px-6 py-4 border border-primary/10 text-center">
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Thank you for choosing <span className="font-semibold text-primary-dark">Oryx Spa</span>. We look forward to welcoming you again. 🌸
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
