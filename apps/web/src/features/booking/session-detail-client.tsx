"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/shared/store";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  MapPin,
  Receipt,
} from "lucide-react";

interface SessionDetailClientProps {
  id: string;
}

export function SessionDetailClient({ id }: SessionDetailClientProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const removeBooking = useBookingStore((state) => state.removeBooking);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const booking = useBookingStore((state) =>
    state.bookings.find((b) => b.id === id)
  );

  if (!isMounted) {
    return <div className="flex-1 bg-white" />;
  }

  // If we can't find it, we'll fall back gracefully
  if (!booking) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-primary-dark font-serif text-2xl">
          Session not found
        </h2>
        <button
          onClick={() => router.back()}
          className="text-primary mt-6 hover:underline"
        >
          Go back to Profile
        </button>
      </div>
    );
  }

  const isCompleted = booking.status === "completed";
  const statusColor = isCompleted
    ? "bg-gray-100 text-gray-500"
    : "bg-primary/10 text-primary";
  const statusText = isCompleted ? "Completed" : "Upcoming";
  const sessionDate = booking.date;
  const sessionTime = booking.time;

  const primaryItem = booking.cartItems[0]?.item;
  const addons = booking.cartItems.flatMap((c) => c.selectedAddons || []);
  const subtotal = booking.totalPrice;

  if (!primaryItem) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-primary/10 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-between border-b bg-white px-6 pt-6 pb-4">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="text-text-secondary -ml-2 rounded-full p-2 transition-colors hover:bg-black/5"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-primary-dark ml-2 font-serif text-2xl font-medium">
            Session Details
          </h1>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${statusColor}`}
        >
          {statusText}
        </span>
      </div>

      <div className="px-6 pt-[90px] pb-8">
        {/* Ticket Card */}
        <div className="border-primary/10 relative overflow-hidden rounded-[32px] border bg-white shadow-sm">
          {/* Top Section - Service Info */}
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <img
                  src={primaryItem.imageUrl}
                  alt={primaryItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-right">
                <p className="text-text-secondary mb-1 text-[10px] font-bold tracking-wider uppercase">
                  Booking Ref
                </p>
                <p className="text-text-primary text-sm font-medium">
                  {booking.bookingRef}
                </p>
              </div>
            </div>

            <h2 className="text-primary-dark mb-4 font-serif text-2xl leading-tight">
              {booking.cartItems.length > 1
                ? `${primaryItem.name} + ${booking.cartItems.length - 1} more`
                : primaryItem.name}
            </h2>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="text-text-secondary mb-1 flex items-center text-[10px] font-bold tracking-wider uppercase">
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> Date
                </p>
                <p className="text-text-primary text-sm font-medium">
                  {sessionDate}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-1 flex items-center text-[10px] font-bold tracking-wider uppercase">
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Time
                </p>
                <p className="text-text-primary text-sm font-medium">
                  {sessionTime} (60 min)
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start text-sm">
              <MapPin className="mt-0.5 mr-3 h-4 w-4 shrink-0 text-[#c8a24a]" />
              <div>
                <p className="text-text-primary font-medium">
                  ORYX Spa & Salon Main Branch
                </p>
                <p className="text-text-secondary mt-0.5 text-xs">
                  West Bay, Doha, Qatar
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Divider */}
          <div className="relative flex items-center justify-between px-4">
            <div className="absolute left-[-8px] h-4 w-4 rounded-full bg-white"></div>
            <div className="w-full border-t-2 border-dashed border-gray-200"></div>
            <div className="absolute right-[-8px] h-4 w-4 rounded-full bg-white"></div>
          </div>

          {/* Bottom Section - Receipt */}
          <div className="bg-gray-50/50 p-6">
            <h3 className="text-primary-dark mb-4 flex items-center font-serif text-lg">
              <Receipt className="text-text-secondary mr-2 h-4 w-4" /> Payment
              Summary
            </h3>

            <div className="mb-4 space-y-3 text-sm">
              {booking.cartItems.map((cartItem, idx) => (
                <div
                  key={`item-${idx}`}
                  className="flex items-start justify-between"
                >
                  <div>
                    <span className="text-text-primary font-medium">
                      1x {cartItem.item.name}
                    </span>
                    {cartItem.selectedVariant && (
                      <span className="text-text-secondary mt-0.5 block text-xs">
                        {cartItem.selectedVariant.name}
                      </span>
                    )}
                  </div>
                  <span className="text-text-primary">
                    QAR{" "}
                    {cartItem.item.price +
                      (cartItem.selectedVariant?.price || 0)}
                  </span>
                </div>
              ))}

              {addons.map((addon, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div>
                    <span className="text-text-primary font-medium">
                      1x {addon.name}
                    </span>
                    <span className="text-text-secondary mt-0.5 block text-[10px] tracking-wide uppercase">
                      Add-on
                    </span>
                  </div>
                  <span className="text-text-primary">QAR {addon.price}</span>
                </div>
              ))}
            </div>

            <div className="text-text-secondary space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>QAR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>QAR 0.00</span>
              </div>
            </div>

            <div className="text-primary-dark mt-4 flex justify-between border-t border-gray-200 pt-4 text-lg font-medium">
              <span>Total Paid</span>
              <span>QAR {subtotal}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {isCompleted ? (
            <>
              <button className="bg-primary w-full rounded-2xl py-4 font-medium text-white shadow-md transition-opacity hover:opacity-90">
                Book Again
              </button>
              <button className="text-text-primary flex w-full items-center justify-center rounded-2xl border border-gray-100 bg-white py-4 font-medium shadow-sm transition-colors hover:bg-gray-50">
                <FileText className="text-text-secondary mr-2 h-5 w-5" />{" "}
                Download Invoice
              </button>
            </>
          ) : (
            <>
              <button className="bg-primary w-full rounded-2xl py-4 font-medium text-white shadow-md transition-opacity hover:opacity-90">
                Reschedule Session
              </button>
              <button
                onClick={() => {
                  removeBooking(booking.id);
                  router.back();
                }}
                className="text-text-primary w-full rounded-2xl border border-gray-100 bg-white py-4 font-medium shadow-sm transition-colors hover:bg-gray-50"
              >
                Cancel Booking
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
