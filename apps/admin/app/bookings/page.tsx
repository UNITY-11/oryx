"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

import { AddBookingModal } from "../../src/features/bookings/add-booking-modal";
import { fetchBookings } from "../../src/features/bookings/api";
import { Booking, BookingStatus } from "../../src/features/bookings/mock-data";

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams]);
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">(
    "All"
  );
  const [sortField, setSortField] = useState<
    "id" | "date" | "amount" | "customerName"
  >("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Handlers
  const handleAddBooking = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Derived State
  const filteredAndSortedBookings = bookings
    .filter((b) => statusFilter === "All" || b.status === statusFilter)
    .filter(
      (b) =>
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        // Compare date + time
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        comparison = dateA - dateB;
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortField === "customerName") {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === "id") {
        comparison = a.id.localeCompare(b.id);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <div className="flex h-full flex-col space-y-6 md:space-y-8">
      {/* Header Area */}

      {/* Combined Table and Filters */}
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Filters and Search Bar */}
        <div className="border-primary/10 z-10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <div className="relative w-full shrink-0 md:w-96">
            <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 transition-colors focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="scrollbar-hide flex w-full shrink-0 items-center space-x-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
            <div className="text-text-secondary flex items-center px-2">
              <Filter className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Status:</span>
            </div>
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "text-text-secondary border-primary/10 bg-white hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="scrollbar-hide flex-1 overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#fcf4f0]">
              <tr className="border-primary/10 text-text-secondary border-b text-xs tracking-wider uppercase">
                <th
                  className="group cursor-pointer py-4 pl-6 font-medium md:pl-8"
                  onClick={() => toggleSort("id")}
                >
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown
                      className={`ml-1 h-3 w-3 transition-opacity ${sortField === "id" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                    />
                  </div>
                </th>
                <th
                  className="group cursor-pointer py-4 font-medium"
                  onClick={() => toggleSort("customerName")}
                >
                  <div className="flex items-center">
                    Customer
                    <ArrowUpDown
                      className={`ml-1 h-3 w-3 transition-opacity ${sortField === "customerName" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                    />
                  </div>
                </th>
                <th className="py-4 font-medium">Service & Add-ons</th>
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
                    colSpan={6}
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
                  <td colSpan={6} className="py-12 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-text-secondary py-12 text-center"
                  >
                    No bookings found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="hover:bg-primary/5 group cursor-pointer transition-colors"
                  >
                    <td className="text-text-secondary py-5 pl-6 font-mono text-xs md:pl-8">
                      {booking.id}
                    </td>
                    <td className="py-5">
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
                      {(booking.services[0]?.addons?.length ?? 0) > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {booking.services[0]?.addons.map((addon, idx) => (
                            <span
                              key={idx}
                              className="text-text-secondary inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] tracking-wider uppercase"
                            >
                              + {addon}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-text-secondary py-5">
                      <p className="font-medium">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mt-0.5 text-sm">{booking.time}</p>
                    </td>
                    <td className="py-5">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                          booking.status === "Confirmed"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : booking.status === "Pending"
                              ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                              : booking.status === "Completed"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
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
      </div>

      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBooking={handleAddBooking}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
