import { useEffect, useState } from "react";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import { fetchBookings } from "../api";
import { Booking } from "../types";

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
    const timer = setInterval(() => setRealTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return {
    currentDate,
    setCurrentDate,
    realTime,
    bookings,
    loading,
    error,
  };
}
