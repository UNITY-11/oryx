"use client";

import { useCalendarBookings } from "@features/bookings/api/use-calendar-bookings";
import { CalendarView } from "@features/bookings/ui/calendar-view";

export default function CalendarPage() {
  const { currentDate, setCurrentDate, realTime, bookings, loading, error } =
    useCalendarBookings();

  return (
    <CalendarView
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      realTime={realTime}
      bookings={bookings}
      loading={loading}
      error={error}
    />
  );
}
