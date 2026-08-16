import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  User,
} from "lucide-react";

import { Booking } from "../types";

const START_HOUR = 8;
const END_HOUR = 20; // 8:00 PM
const HOUR_WIDTH = 240; // px per hour to give horizontal space
const ROW_HEIGHT = 90; // px per booking row

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  realTime: Date;
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export function CalendarView({
  currentDate,
  setCurrentDate,
  realTime,
  bookings,
  loading,
  error,
}: CalendarViewProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formattedDate = toLocalDateString(currentDate);
  const todayStr = toLocalDateString(realTime);
  const isToday = formattedDate === todayStr;

  const handleDateChange = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return;
    setCurrentDate(new Date(y, m - 1, d));
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    if (isToday) {
      const currentH = realTime.getHours();
      const currentM = realTime.getMinutes();
      const scrollPosition =
        (currentH - START_HOUR + currentM / 60) * HOUR_WIDTH;
      const containerWidth = scrollContainerRef.current.clientWidth;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollPosition - containerWidth / 2),
        behavior: "smooth",
      });
    } else {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [formattedDate, isToday, realTime]);

  const rawBookings = bookings
    .filter((b) => b.date === formattedDate && b.status !== "Cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  const laneEndTimes: number[] = [];
  const dayBookings = rawBookings.map((booking) => {
    const parts = booking.time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + 60;

    let laneIndex = laneEndTimes.findIndex(
      (endTime) => endTime <= startMinutes
    );
    if (laneIndex === -1) {
      laneIndex = laneEndTimes.length;
      laneEndTimes.push(endMinutes);
    } else {
      laneEndTimes[laneIndex] = endMinutes;
    }

    return { ...booking, laneIndex };
  });

  const hours = [];
  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const label = i === 12 ? "12 PM" : i > 12 ? `${i - 12} PM` : `${i} AM`;
    hours.push({ value: i, label });
  }

  const getBookingStyle = (time: string, index: number) => {
    const parts = time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;

    const normalizedH = Math.max(START_HOUR, Math.min(h, END_HOUR));

    const leftPx = (normalizedH - START_HOUR + m / 60) * HOUR_WIDTH;
    const widthPx = HOUR_WIDTH;
    const topPx = index * ROW_HEIGHT + 24;

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
      top: `${topPx}px`,
      height: `${ROW_HEIGHT - 12}px`,
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

  const dateLabel = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const sessionsLabel = isToday
    ? `${dayBookings.length} Sessions Today`
    : `${dayBookings.length} Sessions`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 pt-4 pb-4">
        <header className="border-primary/10 z-30 flex w-full shrink-0 flex-col gap-4 rounded-3xl border bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl sm:h-20 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <MobileMenuButton />
            <div className="min-w-0 flex-1">
              <h1 className="text-primary-dark truncate font-serif text-lg font-medium sm:text-2xl">
                {dateLabel}
              </h1>
              <div className="text-text-secondary mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium sm:text-sm">
                {isToday && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {realTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="bg-primary/30 hidden h-1 w-1 rounded-full sm:block" />
                  </>
                )}
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {sessionsLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center sm:pl-2">
            <label
              className="border-primary/10 flex w-full min-w-0 items-center gap-2 rounded-xl border bg-[#fcf4f0] px-3 py-2.5 sm:w-auto sm:min-w-[220px]"
              htmlFor="calendar-date-picker"
            >
              <CalendarIcon className="text-primary h-5 w-5 shrink-0" />
              <span className="text-text-secondary shrink-0 text-xs font-semibold tracking-wide uppercase">
                Date
              </span>
              <input
                id="calendar-date-picker"
                type="date"
                value={formattedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-primary-dark min-w-0 flex-1 cursor-pointer border-0 bg-transparent text-sm font-semibold [color-scheme:light] outline-none"
              />
            </label>
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

          <div className="pointer-events-none absolute inset-0 top-12 z-0 flex">
            {hours.map((hour) => (
              <div
                key={`grid-${hour.value}`}
                className="border-primary/20 h-full shrink-0 border-l"
                style={{ width: `${HOUR_WIDTH}px` }}
              />
            ))}
          </div>

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

          <div className="absolute inset-0 top-12">
            {dayBookings.map((booking) => (
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
              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                <div className="text-text-secondary border-primary/10 flex items-center gap-2 rounded-full border bg-white/90 px-6 py-3 shadow-sm backdrop-blur-sm">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading
                  bookings...
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-white/90 px-6 py-3 text-red-500 shadow-sm backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5" /> {error}
                </div>
              </div>
            )}

            {!loading && !error && dayBookings.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                <div className="text-text-secondary border-primary/10 rounded-full border bg-white/90 px-6 py-3 shadow-sm backdrop-blur-sm">
                  No bookings scheduled for this date.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
