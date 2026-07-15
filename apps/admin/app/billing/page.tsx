"use client";

import { useState } from "react";
import { 
  Menu, Receipt, Search, Clock, CheckCircle2, 
  Printer, MessageCircle, X, ChevronRight, Users, DollarSign
} from "lucide-react";
import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../src/features/services/mock-data";

type FilterStatus = "All" | "Started" | "Completed";
type BillingBooking = typeof MOCK_BOOKINGS[0];

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

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<BillingBooking | null>(null);
  const [printMode, setPrintMode] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (booking: BillingBooking) => {
    const lines = getServiceLineItems(booking);
    let servicesText = lines
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
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="shrink-0 pt-4 pb-4">
        <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-serif text-2xl font-medium text-primary-dark">Billing</h1>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                {startedCount} in session · {completedCount} completed
              </p>
            </div>
          </div>

          {/* Search */}
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

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-hidden flex flex-col gap-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-white rounded-[28px] border border-primary/10 shadow-sm px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-0.5">Total Billable</p>
              <p className="text-xl font-bold text-primary-dark">QAR {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-[28px] border border-primary/10 shadow-sm px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-0.5">In Session</p>
              <p className="text-xl font-bold text-primary-dark">{startedCount} Active</p>
            </div>
          </div>
          <div className="bg-white rounded-[28px] border border-primary/10 shadow-sm px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-0.5">Completed</p>
              <p className="text-xl font-bold text-primary-dark">{completedCount} Done</p>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 overflow-hidden flex gap-4 min-h-0">

          {/* ── Left: Session List ── */}
          <div className={`flex flex-col bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden transition-all duration-300 ${selected ? "w-[380px] shrink-0" : "flex-1"}`}>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-primary/5 shrink-0">
              {(["All", "Started", "Completed"] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                    filter === f
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-transparent text-text-secondary border-primary/10 hover:border-primary/30 hover:text-primary-dark"
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="ml-auto text-xs text-text-secondary font-medium">{billable.length} sessions</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-primary/5">
              {billable.length === 0 ? (
                <div className="py-20 text-center text-text-secondary italic text-sm">
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
                      className={`w-full flex items-center gap-4 px-5 py-4 transition-all text-left group ${
                        isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-[#fcf4f0]/60 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-serif shrink-0 border ${
                        isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-[#fcf4f0] border-primary/10 text-primary"
                      }`}>
                        {booking.customerName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-primary-dark text-sm truncate">{booking.customerName}</p>
                          <p className="font-bold text-primary-dark text-sm shrink-0">QAR {total}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-text-secondary truncate">{booking.date} · {booking.time}</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                            isStarted
                              ? "bg-primary-dark text-white"
                              : "bg-primary text-white"
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

          {/* ── Right: Invoice Detail ── */}
          {selected && (
            <div className="flex-1 bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-200">
              
              {/* Invoice Header */}
              <div className="px-8 py-6 border-b border-primary/5 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-serif font-bold text-primary-dark">{selected.customerName}</h2>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selected.status === "Started" ? "bg-primary-dark text-white" : "bg-primary text-white"
                    }`}>
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-mono">{selected.id}</p>
                  <p className="text-xs text-text-secondary mt-1">{selected.date}  ·  {selected.time}  ·  {selected.phone}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center text-text-secondary hover:text-primary-dark hover:bg-primary/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Body — scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 space-y-6">

                {/* Branding */}
                <div className="flex justify-between items-start pb-6 border-b border-primary/10">
                  <div>
                    <div className="text-2xl font-serif text-primary-dark">Oryx Spa</div>
                    <div className="text-[10px] text-text-secondary tracking-widest uppercase mt-0.5">Luxury Beauty & Wellness</div>
                    <div className="text-xs text-text-secondary mt-3 space-y-0.5">
                      <p>123 Pearl Boulevard, Doha, Qatar</p>
                      <p>+974 4444 0000 · CR: 123456789</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-dark">INVOICE</p>
                    <p className="text-xs font-mono text-text-secondary mt-0.5">{selected.id}</p>
                    <p className="text-xs text-text-secondary mt-2">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                  </div>
                </div>

                {/* Bill To */}
                <div className="bg-[#fcf4f0] rounded-2xl px-5 py-4 border border-primary/5">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Billed To</p>
                  <p className="font-bold text-primary-dark">{selected.customerName}</p>
                  <p className="text-sm text-text-secondary">{selected.phone}</p>
                </div>

                {/* Line Items */}
                <div>
                  <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b-2 border-primary/10 pb-2 mb-3">
                    <span>Description</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="space-y-3">
                    {selectedLines.map((svc, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary-dark text-sm">{svc.name}</span>
                          <span className="font-bold text-primary-dark text-sm">QAR {svc.base}</span>
                        </div>
                        {svc.addons.map((a, j) => (
                          <div key={j} className="flex justify-between items-center mt-1 pl-4">
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

                {/* Total */}
                <div className="bg-primary-dark text-white rounded-2xl px-6 py-5 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl">QAR {selectedTotal}</span>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-text-secondary">Thank you for choosing Oryx Spa 🌸</p>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-5 border-t border-primary/5 flex gap-3 shrink-0">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
                <button
                  onClick={() => handleWhatsApp(selected)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send via WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* Empty state when nothing selected */}
          {!selected && (
            <div className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}
