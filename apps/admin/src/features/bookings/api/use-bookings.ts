import { useState, useEffect } from "react";
import { fetchBookings, createBooking } from "../api";
import { Booking, BookingStatus } from "../mock-data";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

export function useBookings() {
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

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("All");
  const [sortField, setSortField] = useState<"id" | "date" | "amount" | "customerName">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Handlers
  const handleAddBooking = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Derived State
  const filteredAndSortedBookings = bookings
    .filter((b) => statusFilter === "All" || b.status === statusFilter)
    .filter(
      (b) =>
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        // Compare date + time
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        comparison = dateA - dateB;
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortField === "customerName") {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === "id") {
        comparison = a.id.localeCompare(b.id);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  return {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    toggleSort,
    filteredAndSortedBookings,
    handleAddBooking,
    createBooking
  };
}
