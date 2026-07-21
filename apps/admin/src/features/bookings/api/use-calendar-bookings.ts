import { useState, useEffect } from "react";
import { fetchBookings } from "../api";
import { Booking } from "../mock-data";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

export function useCalendarBookings() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [realTime, setRealTime] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadBookings = () => {
    fetchBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadBookings();
  }, []);

  useSanityListener('*[_type == "booking"]', reloadBookings);

  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return {
    currentDate,
    setCurrentDate,
    realTime,
    bookings,
    loading,
    error,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
}
