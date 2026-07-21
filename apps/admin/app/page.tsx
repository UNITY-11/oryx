"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Loader2,
  ShoppingBag,
  Users,
} from "lucide-react";

import { fetchBookings } from "@features/bookings/api";
import { Booking } from "@features/bookings/mock-data";
import { fetchCustomers } from "@features/customers/api";
import { fetchProducts } from "@features/products/api";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [activeProductCount, setActiveProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchBookings(), fetchCustomers(), fetchProducts()])
      .then(([b, c, p]) => {
        setBookings(b);
        setCustomerCount(c.filter((cust) => cust.status === "Active").length);
        setActiveProductCount(
          p.filter((prod) => prod.status === "Active").length
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="flex h-full flex-col space-y-6 pb-4 md:space-y-8 md:pb-0">
      <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-primary-dark mb-1 font-serif text-3xl">
                {loading ? (
                  <Loader2 className="text-primary/40 h-6 w-6 animate-spin" />
                ) : (
                  stat.value
                )}
              </h3>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 shrink-0 border-b p-6 md:p-8">
          <h2 className="text-primary-dark m-0 font-serif text-2xl font-medium">
            Recent Bookings
          </h2>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#fcf4f0]">
              <tr className="border-primary/10 text-text-secondary border-b text-xs tracking-wider uppercase">
                <th className="py-4 pl-6 font-medium md:pl-8">Customer</th>
                <th className="py-4 font-medium">Service</th>
                <th className="py-4 font-medium">Date & Time</th>
                <th className="py-4 font-medium">Status</th>
                <th className="py-4 pr-6 text-right font-medium md:pr-8">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-primary/5 divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
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
                  <td colSpan={5} className="py-12 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-text-secondary py-12 text-center"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-primary/5 group transition-colors"
                  >
                    <td className="text-primary-dark py-4 pl-6 font-medium md:pl-8">
                      {booking.customerName}
                    </td>
                    <td className="text-text-secondary py-4">
                      {booking.services[0]?.name ?? "Custom Session"}
                    </td>
                    <td className="text-text-secondary py-4">
                      {booking.date} · {booking.time}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          booking.status === "Confirmed" ||
                          booking.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="text-primary-dark py-4 pr-6 text-right font-medium md:pr-8">
                      QAR {booking.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
