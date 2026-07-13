"use client";

import { useState, useRef, TouchEvent } from "react";
import { useBookingStore } from "@/shared/store";
import { BookingFlow } from "@/features/booking/booking-flow";
import Link from "next/link";
import { ChevronRight, Calendar as CalendarIcon, Clock, Settings, LogOut } from "lucide-react";

export function SwipeableBookings() {
  const [activeTab, setActiveTab] = useState<"current" | "upcoming" | "completed">("current");
  
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
  const upcomingBookings = bookings.filter(b => b.status === "upcoming");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const renderBookingList = (list: typeof bookings, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 text-center flex flex-col items-center justify-center mt-2">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-primary/40" />
          </div>
          <h4 className="font-serif text-lg text-primary-dark mb-2">No sessions found</h4>
          <p className="text-sm text-text-secondary max-w-[200px] mb-6">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {list.map((booking) => {
          const primaryItem = booking.cartItems[0]?.item;
          if (!primaryItem) return null;
          
          return (
            <Link key={booking.id} href={`/session/${booking.id}`} className="block bg-white rounded-3xl p-4 shadow-sm border border-primary/20 relative overflow-hidden group hover:shadow-md transition-all active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
              <div className="flex space-x-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img src={primaryItem.imageUrl} alt={primaryItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">{booking.status}</span>
                      <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-serif text-[15px] text-primary-dark leading-tight line-clamp-1 mb-2 pr-2">
                      {booking.cartItems.length > 1 ? `${primaryItem.name} + ${booking.cartItems.length - 1} more` : primaryItem.name}
                    </h4>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-text-secondary">
                      <CalendarIcon className="w-3.5 h-3.5 mr-2 text-[#E5C37A]" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center text-xs text-text-secondary">
                      <Clock className="w-3.5 h-3.5 mr-2 text-[#E5C37A]" />
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
    <div className="flex flex-col h-[100dvh] w-full bg-[#faf6f3] md:bg-white overflow-hidden relative">
      <div className="pt-6 px-6 bg-white shrink-0 z-10 md:hidden">
        <h1 className="font-serif text-3xl font-medium text-primary-dark mb-4">Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="flex w-full border-b border-primary/20 bg-white px-6 md:pt-6 shrink-0 relative z-10">
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
          className="absolute bottom-0 h-0.5 bg-primary transition-transform duration-300"
          style={{ 
            width: "calc((100% - 3rem) / 3)",
            transform: `translateX(calc(${activeTab === "current" ? 0 : activeTab === "upcoming" ? 100 : 200}%))` 
          }}
        />
      </div>

      {/* Swipable Area */}
      <div 
        className="flex-1 overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex w-[300%] h-full transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${activeTab === "current" ? 0 : activeTab === "upcoming" ? 33.333 : 66.666}%)` 
          }}
        >
          {/* Current Booking / Cart */}
          <div className="w-1/3 h-full overflow-hidden relative flex flex-col min-h-0 bg-[#faf6f3] md:bg-transparent">
            <BookingFlow isIntegrated={true} />
          </div>

          {/* Upcoming Bookings */}
          <div className="w-1/3 px-6 h-full overflow-y-auto pb-24 relative bg-[#faf6f3] md:bg-transparent">
            {renderBookingList(upcomingBookings, "You have no upcoming sessions.")}
          </div>

          {/* Completed Bookings */}
          <div className="w-1/3 px-6 h-full overflow-y-auto pb-24 relative bg-[#faf6f3] md:bg-transparent">
            {renderBookingList(completedBookings, "You have no completed sessions.")}
          </div>
        </div>
      </div>
    </div>
  );
}
