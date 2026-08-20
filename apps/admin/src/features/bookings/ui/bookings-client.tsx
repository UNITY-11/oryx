"use client";

import type { BookingsPageResponse } from "@/features/bookings/api/bookings-list-types";
import { useBookings } from "@/features/bookings/api/use-bookings";
import { BookingsList } from "@/features/bookings/ui/bookings-list";

export function BookingsClient({
  initialData,
}: {
  initialData: BookingsPageResponse;
}) {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    toggleSort,
    bookings,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
    handleAddBooking,
    createBooking,
  } = useBookings(initialData);

  return (
    <BookingsList
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      sortField={sortField}
      toggleSort={toggleSort}
      bookings={bookings}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      totalItems={totalItems}
      from={from}
      to={to}
      hasPrev={hasPrev}
      hasNext={hasNext}
      handleAddBooking={handleAddBooking}
      createBooking={createBooking}
    />
  );
}
