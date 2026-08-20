import React, { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/shared/ui/list-pagination";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import { createBooking, fetchBookingsPage } from "../api";
import { Booking, BookingStatus } from "../types";
import type {
  BookingsPageResponse,
  BookingsSortField,
} from "./bookings-list-types";

export function useBookings(initialData?: BookingsPageResponse) {
  const [bookings, setBookings] = useState<Booking[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">(
    "All"
  );
  const [sortField, setSortField] = useState<BookingsSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(initialData?.total ?? 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortField, sortOrder]);

  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchBookingsPage({
      q: debouncedSearch,
      status: statusFilter,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: sortField,
      order: sortOrder,
    })
      .then((result) => {
        setBookings(result.items);
        setTotalItems(result.total);
        setTotalPages(result.totalPages);
        if (page > result.totalPages) {
          setPage(result.totalPages);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      )
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter, page, sortField, sortOrder]);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current && initialData) {
      isFirstRender.current = false;
      return;
    }
    loadBookings();
  }, [loadBookings, initialData]);

  useSanityListener('*[_type == "booking"]', loadBookings);

  const handleAddBooking = () => {
    setPage(1);
    loadBookings();
  };

  const toggleSort = (field: BookingsSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const pageSize = DEFAULT_PAGE_SIZE;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    sortOrder,
    toggleSort,
    bookings,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    handleAddBooking,
    createBooking,
    reloadBookings: loadBookings,
  };
}
