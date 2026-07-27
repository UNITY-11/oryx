"use client";

import { useRouter } from "next/navigation";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
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
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = usePagination(billable, 20, `${search}|${filter}`);

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

      {/*
        Mobile: page scrolls so stats can move up and table comes into view.
        md+: page is locked; only the table body scrolls.
      */}
      <div className="scrollbar-hide flex h-full min-h-0 flex-col overflow-y-auto md:overflow-hidden">
        <div className="shrink-0 pt-4 pb-3 sm:pb-4">
          <header className="border-primary/10 z-30 flex w-full flex-col gap-3 rounded-2xl border bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:px-4 sm:py-3.5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 lg:h-20 lg:px-10 lg:py-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <MobileMenuButton />
              <div className="min-w-0">
                <h1 className="text-primary-dark truncate font-serif text-lg font-medium sm:text-xl md:text-2xl">
                  Billing
                </h1>
                <p className="text-text-secondary mt-0.5 truncate text-[11px] font-medium sm:text-xs">
                  {startedCount} in session · {completedCount} completed
                </p>
              </div>
            </div>
            <div className="border-primary/10 flex w-full items-center gap-2 rounded-2xl border bg-[#fcf4f0] px-3 py-2.5 md:w-72 md:shrink-0 lg:w-80">
              <Search className="text-primary/50 h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Search client or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-primary-dark placeholder:text-text-secondary min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </header>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 pb-4 sm:gap-4 md:overflow-hidden md:pb-0">
          <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
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
                className="border-primary/10 flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-3.5 shadow-sm sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 md:px-6 md:py-5"
              >
                <div className="border-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-[#fcf4f0] sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-text-secondary mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                    {label}
                  </p>
                  <p className="text-primary-dark truncate text-base font-bold sm:text-lg md:text-xl">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Table panel: min height on mobile so after scrolling to it, rows scroll inside */}
          <div className="border-primary/10 flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px] md:min-h-0">
            <div className="border-primary/5 flex shrink-0 flex-col gap-2.5 border-b p-3 sm:flex-row sm:items-center sm:gap-2 sm:p-4 md:px-6">
              <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto sm:gap-2">
                {(["All", "Started", "Completed"] as FilterStatus[]).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all sm:px-4 sm:text-xs ${
                        filter === f
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "text-text-secondary border-primary/10 hover:border-primary/30 hover:text-primary-dark bg-transparent"
                      }`}
                    >
                      {f}
                    </button>
                  )
                )}
              </div>
              <span className="text-text-secondary text-xs font-medium sm:ml-auto">
                {totalItems} sessions
              </span>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6">
              {loading ? (
                <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
                  <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
                  <p>Loading sessions...</p>
                </div>
              ) : error ? (
                <div className="flex h-48 flex-col items-center justify-center text-red-500">
                  <AlertCircle className="mb-3 h-8 w-8" />
                  <p className="px-4 text-center text-sm">{error}</p>
                </div>
              ) : totalItems === 0 ? (
                <div className="text-text-secondary flex h-48 flex-col items-center justify-center px-4 text-center italic">
                  No billable sessions found.
                </div>
              ) : (
                <div className="border-primary/10 overflow-hidden rounded-2xl border">
                  <div className="text-text-secondary border-primary/10 sticky top-0 z-10 hidden grid-cols-[1.5fr_2fr_100px_100px_180px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase lg:grid">
                    <span>Client</span>
                    <span>Services</span>
                    <span className="text-center">Total</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="divide-primary/5 divide-y">
                    {paginatedItems.map((booking) => {
                      const total = getTotal(booking, services);
                      const isStarted = booking.status === "Started";

                      return (
                        <div
                          key={booking.id}
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="hover:bg-primary/5 grid cursor-pointer grid-cols-1 gap-3 px-3.5 py-4 transition-colors sm:gap-4 sm:px-5 md:px-6 lg:grid-cols-[1.5fr_2fr_100px_100px_180px] lg:items-center"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="border-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-[#fcf4f0] font-serif text-lg">
                              {booking.customerName.charAt(0)}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-primary-dark truncate text-sm font-semibold">
                                  {booking.customerName}
                                </span>
                                <span className="text-primary-dark shrink-0 text-sm font-bold lg:hidden">
                                  QAR {total}
                                </span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="text-text-secondary truncate text-xs">
                                  {booking.date} · {booking.time}
                                </span>
                                <span
                                  className={`text-[10px] font-bold tracking-wider uppercase lg:hidden ${
                                    isStarted
                                      ? "text-primary-dark"
                                      : "text-primary"
                                  }`}
                                >
                                  · {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 pl-[3.25rem] lg:pl-0">
                            <span className="text-text-secondary line-clamp-2 text-sm lg:line-clamp-1 lg:truncate">
                              {booking.services.map((s) => s.name).join(", ")}
                            </span>
                          </div>

                          <div className="hidden items-center justify-center lg:flex">
                            <span className="text-primary-dark text-sm font-bold">
                              QAR {total}
                            </span>
                          </div>

                          <div className="hidden text-center lg:block">
                            <span
                              className={`inline-block shrink-0 text-[10px] font-bold tracking-wider uppercase ${
                                isStarted ? "text-primary-dark" : "text-primary"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div
                            className="flex flex-wrap items-center gap-2 pl-[3.25rem] lg:justify-end lg:pl-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isStarted ? (
                              <button
                                type="button"
                                onClick={() => handleComplete(booking.id)}
                                className="bg-primary inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:h-auto sm:flex-none sm:py-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Complete
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelected(booking);
                                    setShowPrintModal(true);
                                  }}
                                  className="border-primary text-primary hover:bg-primary/5 inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors sm:h-auto sm:flex-none sm:py-1.5"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  Print
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsApp(booking)}
                                  className="bg-primary inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:h-auto sm:flex-none sm:py-1.5"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
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

            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              from={from}
              to={to}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
