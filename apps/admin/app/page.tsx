"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchBookings } from "@features/bookings/api";
import { Booking } from "@features/bookings/types";
import { fetchCustomers } from "@features/customers/api";
import { fetchProducts } from "@features/products/api";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";

function statusBadgeClass(status: Booking["status"]) {
  if (status === "Confirmed" || status === "Completed") {
    return "bg-green-100 text-green-700";
  }
  if (status === "Cancelled") return "bg-red-100 text-red-600";
  if (status === "Started") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [activeProductCount, setActiveProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchBookings(), fetchCustomers(), fetchProducts()])
      .then(([b, c, p]) => {
        setBookings(b);
        setCustomerCount(c.filter((cust) => cust.status === "Active").length);
        setActiveProductCount(
          p.filter((prod) => prod.status === "Active").length
        );
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalRevenue = bookings
    .filter((b) => b.status === "Started" || b.status === "Completed")
    .reduce((sum, b) => sum + b.amount, 0);

  const stats = [
    { label: "Total Bookings", value: String(bookings.length), icon: Calendar },
    {
      label: "Revenue",
      value: `QAR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    { label: "Active Customers", value: String(customerCount), icon: Users },
    {
      label: "Active Products",
      value: String(activeProductCount),
      icon: ShoppingBag,
    },
  ];

  const recentBookings = [...bookings]
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, 6);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden sm:gap-5 md:gap-6">
      {/* Stats */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="border-primary/10 flex flex-col rounded-2xl border bg-white p-3.5 shadow-sm sm:rounded-[28px] sm:p-5 md:p-6"
            >
              <div className="bg-primary/10 text-primary mb-2.5 flex h-9 w-9 items-center justify-center rounded-full sm:mb-4 sm:h-11 sm:w-11">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-primary-dark mb-0.5 truncate font-serif text-lg font-semibold sm:mb-1 sm:text-2xl md:text-3xl">
                {loading ? (
                  <Loader2 className="text-primary/40 h-5 w-5 animate-spin" />
                ) : (
                  stat.value
                )}
              </h3>
              <p className="text-text-secondary text-[11px] sm:text-sm">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent bookings */}
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[28px] md:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-6 sm:py-5 md:px-8">
          <h2 className="text-primary-dark font-serif text-lg font-medium sm:text-xl md:text-2xl">
            Recent Bookings
          </h2>
          <Link
            href="/bookings"
            className="text-primary hover:text-primary-dark shrink-0 text-xs font-semibold sm:text-sm"
          >
            View all
          </Link>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center gap-2 px-4 text-center">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <p className="text-sm">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 px-4 text-center">
              <AlertCircle className="h-7 w-7 text-red-500" />
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                type="button"
                onClick={load}
                className="border-primary text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-text-secondary flex h-48 items-center justify-center px-4 text-center text-sm">
              No bookings yet.
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="divide-primary/5 divide-y lg:hidden">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="hover:bg-primary/5 block px-4 py-3.5 transition-colors sm:px-5"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <p className="text-primary-dark min-w-0 truncate text-sm font-semibold">
                        {booking.customerName}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-text-secondary mb-1 truncate text-xs">
                      {booking.services[0]?.name ?? "Custom Session"}
                    </p>
                    <div className="text-text-secondary flex items-center justify-between gap-2 text-xs">
                      <span className="truncate">
                        {booking.date} · {booking.time}
                      </span>
                      <span className="text-primary-dark shrink-0 font-semibold">
                        QAR {booking.amount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden w-full border-collapse text-left lg:table">
                <thead className="sticky top-0 z-10 bg-[#fcf4f0]">
                  <tr className="border-primary/10 text-text-secondary border-b text-[10px] tracking-wider uppercase">
                    <th className="px-6 py-4 font-medium xl:px-8">Customer</th>
                    <th className="px-4 py-4 font-medium">Service</th>
                    <th className="px-4 py-4 font-medium">Date & Time</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium xl:px-8">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-primary/5 divide-y">
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="text-primary-dark px-6 py-4 font-medium xl:px-8">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="hover:text-primary"
                        >
                          {booking.customerName}
                        </Link>
                      </td>
                      <td className="text-text-secondary max-w-[200px] truncate px-4 py-4">
                        {booking.services[0]?.name ?? "Custom Session"}
                      </td>
                      <td className="text-text-secondary px-4 py-4 whitespace-nowrap">
                        {booking.date} · {booking.time}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="text-primary-dark px-6 py-4 text-right font-medium xl:px-8">
                        QAR {booking.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
