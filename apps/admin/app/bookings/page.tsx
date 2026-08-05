"use client";

import { Suspense } from "react";
import { useBookings } from "@features/bookings/api/use-bookings";
import { BookingsList } from "@features/bookings/ui/bookings-list";

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

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
