import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBulkSelectMode } from "@/shared/hooks/use-bulk-select-mode";
import { useBulkSelection } from "@/shared/hooks/use-bulk-selection";
import {
  BulkDeleteToolbar,
  BulkSelectCheckbox,
  BulkSelectControls,
} from "@/shared/ui/bulk-delete-actions";
import { ListPagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Loader2,
  Search,
} from "lucide-react";

import { deleteBooking } from "../api";
import type { BookingsSortField } from "../api/bookings-list-types";
import { BookingWizard } from "../booking-wizard";
import { Booking, BookingStatus } from "../types";

const STATUS_FILTERS: Array<BookingStatus | "All"> = [
  "All",
  "Pending",
  "Confirmed",
  "Cancelled",
];

function statusBadgeClass(status: Booking["status"]) {
  if (status === "Confirmed")
    return "border-green-200 bg-green-50 text-green-700";
  if (status === "Pending")
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  if (status === "Completed")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Started") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function formatBookingDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface BookingsListProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: BookingStatus | "All";
  setStatusFilter: (status: BookingStatus | "All") => void;
  sortField: BookingsSortField;
  toggleSort: (field: BookingsSortField) => void;
  bookings: Booking[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  handleAddBooking: () => void;
  createBooking: (payload: any) => Promise<Booking>;
  onItemsDeleted?: (ids: string[]) => void;
}

export function BookingsList({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortField,
  toggleSort,
  bookings,
  page,
  setPage,
  totalPages,
  totalItems,
  from,
  to,
  hasPrev,
  hasNext,
  handleAddBooking,
  createBooking,
  onItemsDeleted,
}: BookingsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const selection = useBulkSelection(bookings.map((b) => b.id));
  const select = useBulkSelectMode(selection);
  const isAdding = searchParams.get("action") === "add";
  const step = Number(searchParams.get("step")) || 1;
  const setStep = (newStep: number) => {
    router.push(`?action=add&step=${newStep}`);
  };

  return (
    <div className="flex h-full flex-col space-y-6 md:space-y-8">
      <Toast toast={toast} onClose={closeToast} />
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {isAdding ? (
          <BookingWizard
            step={step}
            setStep={setStep}
            onCancel={() => router.push("/bookings")}
            onSubmit={async (payload) => {
              await createBooking(payload);
              handleAddBooking();
              router.push("/bookings");
            }}
          />
        ) : (
          <>
            <div className="border-primary/10 z-10 flex shrink-0 flex-col gap-4 border-b p-4 md:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative w-full min-w-0 md:max-w-md">
                  <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="search"
                    placeholder="Search name, phone, service, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/60 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 transition-colors focus:ring-1 focus:outline-none"
                  />
                </div>
                {!loading && bookings.length > 0 && (
                  <BulkSelectControls
                    selectMode={select.selectMode}
                    allSelected={selection.allSelected}
                    onSelectToggle={select.toggleSelect}
                    onSelectAll={select.selectAll}
                  />
                )}
              </div>

              <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto pb-1">
                <div className="text-text-secondary flex shrink-0 items-center px-1">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      statusFilter === status
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "text-primary-dark border-primary/10 hover:bg-primary/10 bg-primary/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {!loading && bookings.length > 0 && (
                <BulkDeleteToolbar
                  selection={selection}
                  itemIds={bookings.map((b) => b.id)}
                  entityLabel="bookings"
                  deleteOne={deleteBooking}
                  onDeleted={(ids) => {
                    onItemsDeleted?.(ids);
                    setToast({
                      type: "success",
                      message: `Deleted ${ids.length} booking(s)`,
                    });
                  }}
                  onClear={select.exit}
                  onError={(msg) => setToast({ type: "error", message: msg })}
                />
              )}
            </div>

            {/* Mobile cards */}
            <div className="scrollbar-hide flex-1 space-y-3 overflow-auto p-4 md:hidden">
              {loading ? (
                <div className="text-text-secondary flex items-center justify-center gap-2 py-12">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading
                  bookings...
                </div>
              ) : error ? (
                <div className="flex items-center justify-center gap-2 py-12 text-red-500">
                  <AlertCircle className="h-5 w-5" /> {error}
                </div>
              ) : totalItems === 0 ? (
                <div className="text-text-secondary py-12 text-center">
                  No bookings found matching your filters.
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-primary/10 hover:border-primary/25 flex w-full gap-3 rounded-2xl border bg-[#fcf4f0] p-4 text-left transition-colors"
                  >
                    {select.showCheckboxes && (
                      <BulkSelectCheckbox
                        selection={selection}
                        id={booking.id}
                        label={`Select ${booking.customerName}`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-primary-dark truncate font-semibold">
                            {booking.customerName}
                          </p>
                          <p className="text-text-secondary mt-0.5 truncate text-sm">
                            {booking.phone || "No phone"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadgeClass(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-text-primary truncate text-sm font-medium">
                            {booking.services[0]?.name || "Custom Session"}
                          </p>
                          <p className="text-text-secondary mt-0.5 text-xs">
                            {formatBookingDate(booking.date)} · {booking.time}
                          </p>
                        </div>
                        <p className="text-primary-dark shrink-0 text-sm font-semibold">
                          QAR {booking.amount}
                        </p>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Desktop table */}
            <div className="scrollbar-hide hidden flex-1 overflow-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#fcf4f0]">
                  <tr className="border-primary/10 text-text-secondary border-b text-xs tracking-wider uppercase">
                    {select.showCheckboxes && (
                      <th className="w-10 py-4 pl-4 font-medium md:pl-6" />
                    )}
                    <th
                      className={`group cursor-pointer py-4 font-medium ${
                        select.showCheckboxes ? "pl-2" : "pl-6 md:pl-8"
                      }`}
                      onClick={() => toggleSort("customerName")}
                    >
                      <div className="flex items-center">
                        Customer
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 transition-opacity ${sortField === "customerName" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                        />
                      </div>
                    </th>
                    <th className="py-4 font-medium">Service</th>
                    <th
                      className="group cursor-pointer py-4 font-medium"
                      onClick={() => toggleSort("date")}
                    >
                      <div className="flex items-center">
                        Date & Time
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 transition-opacity ${sortField === "date" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                        />
                      </div>
                    </th>
                    <th className="py-4 font-medium">Status</th>
                    <th
                      className="group cursor-pointer py-4 pr-6 text-right font-medium md:pr-8"
                      onClick={() => toggleSort("amount")}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 transition-opacity ${sortField === "amount" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-primary/5 divide-y">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={select.showCheckboxes ? 6 : 5}
                        className="text-text-secondary py-12 text-center"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" /> Loading
                          bookings...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={select.showCheckboxes ? 6 : 5}
                        className="py-12 text-center text-red-500"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-5 w-5" /> {error}
                        </div>
                      </td>
                    </tr>
                  ) : totalItems === 0 ? (
                    <tr>
                      <td
                        colSpan={select.showCheckboxes ? 6 : 5}
                        className="text-text-secondary py-12 text-center"
                      >
                        No bookings found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                        className="hover:bg-primary/5 group cursor-pointer transition-colors"
                      >
                        {select.showCheckboxes && (
                          <td
                            className="py-5 pl-4 md:pl-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BulkSelectCheckbox
                              selection={selection}
                              id={booking.id}
                            />
                          </td>
                        )}
                        <td
                          className={`py-5 ${select.showCheckboxes ? "pl-2" : "pl-6 md:pl-8"}`}
                        >
                          <p className="text-primary-dark font-medium">
                            {booking.customerName}
                          </p>
                          <p className="text-text-secondary mt-0.5 text-sm">
                            {booking.phone}
                          </p>
                        </td>
                        <td className="py-5">
                          <p className="text-text-primary font-medium">
                            {booking.services[0]?.name || "Custom Session"}
                          </p>
                          {booking.services.length > 1 && (
                            <p className="text-text-secondary mt-0.5 text-[10px] tracking-wider uppercase">
                              + {booking.services.length - 1} more service
                              {booking.services.length > 2 ? "s" : ""}
                            </p>
                          )}
                          {(booking.services[0]?.options?.length ?? 0) > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {(booking.services[0]?.options ?? []).map(
                                (option, idx) => (
                                  <span
                                    key={idx}
                                    className="text-text-secondary inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] tracking-wider uppercase"
                                  >
                                    + {option}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-text-secondary py-5">
                          <p className="font-medium">
                            {formatBookingDate(booking.date)}
                          </p>
                          <p className="mt-0.5 text-sm">{booking.time}</p>
                        </td>
                        <td className="py-5">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-primary-dark py-5 pr-6 text-right font-medium md:pr-8">
                          QAR {booking.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
          </>
        )}
      </div>
    </div>
  );
}
