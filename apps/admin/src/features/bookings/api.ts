import { parseOrThrow } from "@/shared/lib/api-helpers";

import type {
  BookingsPageResponse,
  FetchBookingsPageParams,
} from "./api/bookings-list-types";
import type { Booking } from "./types";

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch("/api/bookings", { cache: "no-store" });
  return parseOrThrow<Booking[]>(res, "Failed to load bookings");
}

export async function fetchBookingsPage(
  params: FetchBookingsPageParams
): Promise<BookingsPageResponse> {
  const qs = new URLSearchParams();
  qs.set("paginated", "1");
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 20));
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.status && params.status !== "All") qs.set("status", params.status);
  if (params.billable) qs.set("billable", "1");
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);

  const res = await fetch(`/api/bookings?${qs.toString()}`, {
    cache: "no-store",
  });
  return parseOrThrow<BookingsPageResponse>(res, "Failed to load bookings");
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
