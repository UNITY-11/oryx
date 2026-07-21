import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MessageCircle,
  Printer,
  Search,
} from "lucide-react";

import { Service } from "../../services/types";
import {
  BillingBooking,
  FilterStatus,
  getServiceLineItems,
  getTotal,
} from "../api/use-billing-data";
import { PrintModal } from "./print-modal";

interface BillingDashboardProps {
  search: string;
  setSearch: (search: string) => void;
  filter: FilterStatus;
  setFilter: (filter: FilterStatus) => void;
  selected: BillingBooking | null;
  setSelected: (booking: BillingBooking | null) => void;
  showPrintModal: boolean;
  setShowPrintModal: (show: boolean) => void;
  bookings: any[];
  services: Service[];
  loading: boolean;
  error: string | null;
  handleComplete: (id: string) => void;
  handleWhatsApp: (booking: BillingBooking) => void;
  billable: BillingBooking[];
  totalRevenue: number;
  startedCount: number;
  completedCount: number;
  selectedLines: any[];
  selectedTotal: number;
}

export function BillingDashboard({
  search,
  setSearch,
  filter,
  setFilter,
  selected,
  setSelected,
  showPrintModal,
  setShowPrintModal,
  bookings,
  services,
  loading,
  error,
  handleComplete,
  handleWhatsApp,
  billable,
  totalRevenue,
  startedCount,
  completedCount,
  selectedLines,
  selectedTotal,
}: BillingDashboardProps) {
  const router = useRouter();

  return (
    <>
      {showPrintModal && selected && (
        <PrintModal
          booking={selected}
          lines={selectedLines}
          total={selectedTotal}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      <div className="flex h-full flex-col overflow-hidden">
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

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
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

          <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
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
                          className="hover:bg-primary/5 grid cursor-pointer grid-cols-1 items-center gap-4 px-6 py-4 transition-colors md:grid-cols-[1.5fr_2fr_100px_100px_180px]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="border-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-[#fcf4f0] font-serif text-lg">
                              {booking.customerName.charAt(0)}
                            </div>
                            <div className="flex min-w-0 flex-col">
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

                          <div className="hidden items-center justify-center md:flex">
                            <span className="text-primary-dark text-sm font-bold">
                              QAR {total}
                            </span>
                          </div>

                          <div className="hidden text-center md:block">
                            <span
                              className={`inline-block shrink-0 text-[10px] font-bold tracking-wider uppercase ${
                                isStarted ? "text-primary-dark" : "text-primary"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2">
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
