import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Menu,
  User,
} from "lucide-react";

import { Booking } from "../types";

const START_HOUR = 8;
const END_HOUR = 20; // 8:00 PM
const HOUR_WIDTH = 240; // px per hour to give horizontal space
const ROW_HEIGHT = 90; // px per booking row

interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  realTime: Date;
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

export function CalendarView({
  currentDate,
  setCurrentDate,
  realTime,
  bookings,
  loading,
  error,
  goToPreviousDay,
  goToNextDay,
  goToToday,
}: CalendarViewProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formattedDate = currentDate.toISOString().split("T")[0];
  const todayStr = realTime.toISOString().split("T")[0];
  const isToday = formattedDate === todayStr;

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    if (isToday) {
      const currentH = realTime.getHours();
      const currentM = realTime.getMinutes();
      const scrollPosition =
        (currentH - START_HOUR + currentM / 60) * HOUR_WIDTH;
      const containerWidth = scrollContainerRef.current.clientWidth;

      // Scroll to perfectly center the current time
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollPosition - containerWidth / 2),
        behavior: "smooth",
      });
    } else {
      // For other days, scroll back to the start (8 AM)
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [formattedDate, isToday, realTime]);

  // Filter bookings for the selected date, excluding cancelled ones
  // Sort them by time so they can be processed left-to-right
  const rawBookings = bookings
    .filter((b) => b.date === formattedDate && b.status !== "Cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  // Calculate lanes to pack bookings efficiently towards the top
  const laneEndTimes: number[] = [];
  const todaysBookings = rawBookings.map((booking) => {
    const parts = booking.time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + 60; // Assume 60 mins duration

    // Find first available lane (where previous booking ended before this starts)
    let laneIndex = laneEndTimes.findIndex(
      (endTime) => endTime <= startMinutes
    );
    if (laneIndex === -1) {
      laneIndex = laneEndTimes.length; // create new lane
      laneEndTimes.push(endMinutes);
    } else {
      laneEndTimes[laneIndex] = endMinutes; // update existing lane
    }

    return { ...booking, laneIndex };
  });

  // Generate hour slots
  const hours = [];
  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const label = i === 12 ? "12 PM" : i > 12 ? `${i - 12} PM` : `${i} AM`;
    hours.push({ value: i, label });
  }

  // Calculate position and width of a booking
  // We assume 60 minutes duration by default
  const getBookingStyle = (time: string, index: number) => {
    const parts = time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;

    const normalizedH = Math.max(START_HOUR, Math.min(h, END_HOUR));

    const leftPx = (normalizedH - START_HOUR + m / 60) * HOUR_WIDTH;
    const widthPx = HOUR_WIDTH; // 60 minutes
    const topPx = index * ROW_HEIGHT + 24; // offset from top header

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
      top: `${topPx}px`,
      height: `${ROW_HEIGHT - 12}px`, // gap between rows
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-primary border-primary-dark text-white shadow-sm";
      case "Pending":
        return "bg-background border-primary text-primary-dark shadow-sm";
      case "Completed":
        return "bg-primary-dark border-black/20 text-white shadow-sm";
      case "Started":
        return "bg-secondary border-primary-dark text-white shadow-sm";
      case "Cancelled":
        return "bg-surface border-background text-text-secondary shadow-sm opacity-90";
      default:
        return "bg-surface border-primary text-primary-dark shadow-sm";
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="shrink-0 pt-4 pb-4">
        <header className="border-primary/10 z-30 flex h-20 w-full shrink-0 items-center justify-between rounded-3xl border bg-white/90 px-6 shadow-sm backdrop-blur-xl lg:px-10">
          <div className="flex flex-1 items-center space-x-4">
            <button className="text-primary hover:bg-primary/5 -ml-2 rounded-full p-2 transition-colors md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden flex-col md:flex">
              <h1 className="text-primary-dark font-serif text-2xl font-medium">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
              <div className="text-text-secondary mt-0.5 flex items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />{" "}
                  {realTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="bg-primary/30 h-1 w-1 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {todaysBookings.length} Sessions
                  Today
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center space-x-3">
            <div className="border-primary/10 flex items-center rounded-xl border bg-[#fcf4f0] p-1">
              <button
                onClick={goToPreviousDay}
                className="text-primary-dark rounded-lg p-2 transition-colors hover:bg-white hover:shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToToday}
                className="text-primary-dark rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-white"
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                className="text-primary-dark rounded-lg p-2 transition-colors hover:bg-white hover:shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      </div>

      <div
        ref={scrollContainerRef}
        className="scrollbar-hide border-primary/10 relative flex-1 overflow-x-auto overflow-y-hidden rounded-[32px] border bg-white shadow-sm"
      >
        <div
          className="relative min-h-full"
          style={{
            width: `${(END_HOUR - START_HOUR + 1) * HOUR_WIDTH}px`,
            minHeight: `${Math.max(1, laneEndTimes.length) * ROW_HEIGHT + 64}px`,
          }}
        >
          {/* Top Time Header (Sticky) */}
          <div className="border-primary/10 sticky top-0 z-20 flex h-12 border-b bg-white/95 backdrop-blur-sm">
            {hours.map((hour) => (
              <div
                key={hour.value}
                className="border-primary/10 flex shrink-0 items-center justify-center border-l first:border-l-0"
                style={{ width: `${HOUR_WIDTH}px` }}
              >
                <span className="text-text-secondary text-xs font-semibold">
                  {hour.label}
                </span>
              </div>
            ))}
          </div>

          {/* Vertical Grid Lines */}
          <div className="pointer-events-none absolute inset-0 top-12 z-0 flex">
            {hours.map((hour) => (
              <div
                key={`grid-${hour.value}`}
                className="border-primary/20 h-full shrink-0 border-l"
                style={{ width: `${HOUR_WIDTH}px` }}
              />
            ))}
          </div>

          {/* Horizontal Grid Lines */}
          <div className="pointer-events-none absolute inset-0 top-12 z-0">
            {Array.from({ length: Math.max(8, laneEndTimes.length + 2) }).map(
              (_, i) => (
                <div
                  key={`h-grid-${i}`}
                  className="border-primary/20 absolute w-full border-t"
                  style={{ top: `${(i + 1) * ROW_HEIGHT}px` }}
                />
              )
            )}
          </div>

          {/* Current Time Indicator */}
          {isToday && (
            <div
              className="pointer-events-none absolute top-12 bottom-0 z-10 border-l-2 border-red-400"
              style={{
                left: `${(realTime.getHours() - START_HOUR + realTime.getMinutes() / 60) * HOUR_WIDTH}px`,
              }}
            >
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-red-400" />
            </div>
          )}

          {/* Bookings Area */}
          <div className="absolute inset-0 top-12">
            {todaysBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className={`absolute flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all hover:shadow-md hover:brightness-95 ${getStatusColor(booking.status)}`}
                style={getBookingStyle(booking.time, booking.laneIndex)}
              >
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <div className="truncate text-sm font-bold">
                      {booking.customerName}
                    </div>
                    <div className="truncate text-xs font-medium opacity-80">
                      {booking.services[0]?.name || "Custom Session"}
                      {booking.services.length > 1 &&
                        ` (+${booking.services.length - 1} more)`}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] opacity-75">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.time} (1h)
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-text-secondary absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading bookings...
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            )}

            {!loading && !error && todaysBookings.length === 0 && (
              <div className="text-text-secondary absolute inset-0 flex items-center justify-center">
                No bookings scheduled for this date.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
