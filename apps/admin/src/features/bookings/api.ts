import { parseOrThrow } from "@/shared/lib/api-helpers";

import type { Booking } from "./types";

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch("/api/bookings", { cache: "no-store" });
  return parseOrThrow<Booking[]>(res, "Failed to load bookings");
}

export async function fetchBooking(id: string): Promise<Booking> {
  const res = await fetch(`/api/bookings/${id}`, { cache: "no-store" });
  return parseOrThrow<Booking>(res, "Failed to load booking");
}

export async function createBooking(
  payload: Partial<Omit<Booking, "id">>
): Promise<Booking> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Booking>(res, "Failed to create booking");
}

export async function updateBooking(
  id: string,
  payload: Partial<Booking>
): Promise<Booking> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Booking>(res, "Failed to update booking");
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(res, "Failed to delete booking");
}
