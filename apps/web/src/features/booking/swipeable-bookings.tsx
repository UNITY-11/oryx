"use client";

import { TouchEvent, useRef, useState } from "react";
import Link from "next/link";
import { BookingFlow } from "@/features/booking/booking-flow";
import { useBookingStore } from "@/shared/store";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  LogOut,
  Settings,
} from "lucide-react";

export function SwipeableBookings() {
  const [activeTab, setActiveTab] = useState<
    "current" | "upcoming" | "completed"
  >("current");

  // Touch gesture state
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (activeTab === "current") setActiveTab("upcoming");
      else if (activeTab === "upcoming") setActiveTab("completed");
    } else if (isRightSwipe) {
      if (activeTab === "completed") setActiveTab("upcoming");
      else if (activeTab === "upcoming") setActiveTab("current");
    }
  };

  const bookings = useBookingStore((state) => state.bookings);
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const renderBookingList = (list: typeof bookings, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="border-primary/10 mt-2 flex flex-col items-center justify-center rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="bg-primary/5 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <CalendarIcon className="text-primary/40 h-8 w-8" />
          </div>
          <h4 className="text-primary-dark mb-2 font-serif text-lg">
            No sessions found
          </h4>
          <p className="text-text-secondary mb-6 max-w-[200px] text-sm">
            {emptyMessage}
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.map((booking) => {
          const primaryItem = booking.cartItems[0]?.item;
          if (!primaryItem) return null;

          return (
            <Link
              key={booking.id}
              href={`/session/${booking.id}`}
              className="border-primary/20 group relative block overflow-hidden rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-bl-full" />
              <div className="flex space-x-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl">
                  <img
                    src={primaryItem.imageUrl}
                    alt={primaryItem.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="mb-1 flex items-start justify-between">
                      <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        {booking.status}
                      </span>
                      <ChevronRight className="text-primary/40 group-hover:text-primary h-4 w-4 transition-colors" />
                    </div>
                    <h4 className="text-primary-dark mb-2 line-clamp-1 pr-2 font-serif text-[15px] leading-tight">
                      {booking.cartItems.length > 1
                        ? `${primaryItem.name} + ${booking.cartItems.length - 1} more`
                        : primaryItem.name}
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-text-secondary flex items-center text-xs">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#A87434]" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="text-text-secondary flex items-center text-xs">
                      <Clock className="mr-2 h-3.5 w-3.5 text-[#A87434]" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#e8baa0] md:bg-white">
      <div className="z-10 shrink-0 bg-white px-6 pt-6 md:hidden">
        <h1 className="text-primary-dark mb-4 font-serif text-3xl font-medium">
          Bookings
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-primary/20 relative z-10 flex w-full shrink-0 border-b bg-white px-6 md:pt-6">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "current" ? "text-primary" : "text-text-secondary"}`}
        >
          New Booking
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "upcoming" ? "text-primary" : "text-text-secondary"}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "completed" ? "text-primary" : "text-text-secondary"}`}
        >
          Completed
        </button>
        {/* Animated indicator */}
        <div
          className="bg-primary absolute bottom-0 h-0.5 transition-transform duration-300"
          style={{
            width: "calc((100% - 3rem) / 3)",
            transform: `translateX(calc(${activeTab === "current" ? 0 : activeTab === "upcoming" ? 100 : 200}%))`,
          }}
        />
      </div>

      {/* Swipable Area */}
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full w-[300%] transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${activeTab === "current" ? 0 : activeTab === "upcoming" ? 33.333 : 66.666}%)`,
          }}
        >
          {/* Current Booking / Cart */}
          <div className="relative flex h-full min-h-0 w-1/3 flex-col overflow-hidden bg-[#e8baa0] md:bg-transparent">
            <BookingFlow isIntegrated={true} />
          </div>

          {/* Upcoming Bookings */}
          <div className="relative h-full w-1/3 overflow-y-auto bg-[#e8baa0] px-6 pb-24 md:bg-transparent">
            {renderBookingList(
              upcomingBookings,
              "You have no upcoming sessions."
            )}
          </div>

          {/* Completed Bookings */}
          <div className="relative h-full w-1/3 overflow-y-auto bg-[#e8baa0] px-6 pb-24 md:bg-transparent">
            {renderBookingList(
              completedBookings,
              "You have no completed sessions."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
