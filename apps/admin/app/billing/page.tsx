"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Receipt, Search, ArrowRight, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../src/features/services/mock-data";

type FilterStatus = "All" | "Started" | "Completed";

export default function BillingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");

  // Only Started and Completed bookings
  const billable = MOCK_BOOKINGS.filter((b) => {
    const matchStatus =
      filter === "All" ? b.status === "Started" || b.status === "Completed" : b.status === filter;
    const matchSearch =
      !search ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    // Started first, then Completed; within each group sort by date desc
    if (a.status === b.status) return b.date.localeCompare(a.date);
    return a.status === "Started" ? -1 : 1;
  });

  const totalRevenue = billable.reduce((s, b) => s + b.amount, 0);
  const startedCount = MOCK_BOOKINGS.filter((b) => b.status === "Started").length;
  const completedCount = MOCK_BOOKINGS.filter((b) => b.status === "Completed").length;

  const getServiceTotal = (booking: (typeof MOCK_BOOKINGS)[0]) => {
    return booking.services.reduce((sum, svc) => {
      const obj = REAL_SERVICES.find((r) => r.name === svc.name);
      const base = obj?.pricingTiers?.[0]?.price || 0;
      const addons = svc.addons.reduce((as, aName) => {
        const a = obj?.addons.find((ad) => ad.name === aName);
        return as + (a?.price || 0);
      }, 0);
      return sum + base + addons;
    }, 0);
  };

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
              <p className="text-xs text-text-secondary font-medium">
                {startedCount} in session · {completedCount} completed
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-[#fcf4f0] border border-primary/10 rounded-2xl px-4 py-2.5 w-64">
            <Search className="w-4 h-4 text-primary/50 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-primary-dark placeholder:text-text-secondary outline-none flex-1"
            />
          </div>
        </header>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-white rounded-[28px] border border-primary/10 p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-primary" /> Total Billable
            </div>
            <p className="text-3xl font-bold text-primary-dark">QAR {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-text-secondary">{billable.length} sessions</p>
          </div>
          <div className="bg-white rounded-[28px] border border-primary/10 p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-primary" /> In Session
            </div>
            <p className="text-3xl font-bold text-primary-dark">{startedCount}</p>
            <p className="text-xs text-text-secondary">Currently active</p>
          </div>
          <div className="bg-white rounded-[28px] border border-primary/10 p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Completed
            </div>
            <p className="text-3xl font-bold text-primary-dark">{completedCount}</p>
            <p className="text-xs text-text-secondary">Ready for invoice</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["All", "Started", "Completed"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-text-secondary border-primary/10 hover:border-primary/30 hover:text-primary-dark"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden">
          {billable.length === 0 ? (
            <div className="py-20 text-center text-text-secondary italic">
              No billable sessions found.
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {billable.map((booking) => {
                const total = getServiceTotal(booking);
                const isStarted = booking.status === "Started";
                return (
                  <button
                    key={booking.id}
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#fcf4f0]/60 transition-colors group text-left"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center text-primary font-serif text-lg shrink-0">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-primary-dark text-sm">{booking.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-text-secondary font-mono">{booking.id}</p>
                          <span className="w-1 h-1 rounded-full bg-primary/20"></span>
                          <p className="text-xs text-text-secondary">{booking.date} · {booking.time}</p>
                        </div>
                        {booking.services.length > 0 && (
                          <p className="text-xs text-text-secondary mt-1">
                            {booking.services.map((s) => s.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-primary-dark">QAR {total}</p>
                        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isStarted
                            ? "bg-primary-dark border-primary-dark text-white"
                            : "bg-primary border-primary-dark text-white"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
