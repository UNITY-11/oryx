import type { BookingsPageResponse } from "@/features/bookings/api/bookings-list-types";
import {
  BOOKINGS_LIST_QUERY,
  buildBookingsListQueries,
  toGroqSearchPattern,
} from "@/features/bookings/sanity-queries";
import type { Booking } from "@/features/bookings/types";
import { buildPaginatedResponse } from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export async function fetchServerBookings() {
  const bookings = await sanityClient.fetch<Booking[]>(BOOKINGS_LIST_QUERY);
  return bookings;
}

export async function fetchServerBookingsPage(
  page: number,
  pageSize: number
): Promise<BookingsPageResponse> {
  const q = "";
  const status = "All";
  const billable = false;
  const sort = "createdAt";
  const order = "desc";

  const phoneDigits = digitsOnly(q);
  const pattern = toGroqSearchPattern(q);
  const phonePattern = phoneDigits.length >= 3 ? `*${phoneDigits}*` : "";

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const { listQuery, countQuery } = buildBookingsListQueries({
    q,
    phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
    status,
    billable,
    sort,
    order,
    start,
    end,
  });

  const queryParams = {
    q,
    pattern: pattern || "*",
    phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
    phonePattern: phonePattern || "*",
    status,
    billable,
  };

  const [items, total] = await Promise.all([
    sanityClient.fetch<Booking[]>(listQuery, queryParams),
    sanityClient.fetch<number>(countQuery, queryParams),
  ]);

  return buildPaginatedResponse(items, total, page, pageSize);
}
