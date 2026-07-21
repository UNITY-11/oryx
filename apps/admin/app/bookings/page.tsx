"use client";

import { Suspense } from "react";
import { useBookings } from "../../src/features/bookings/api/use-bookings";
import { BookingsList } from "../../src/features/bookings/ui/bookings-list";

function BookingsContent() {
  const {
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
  } = useBookings();

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
      filteredAndSortedBookings={filteredAndSortedBookings}
      handleAddBooking={handleAddBooking}
      createBooking={createBooking}
    />
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
