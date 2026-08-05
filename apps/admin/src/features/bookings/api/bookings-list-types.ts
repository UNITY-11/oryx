import type { Booking, BookingStatus } from "../types";

export type BookingsSortField =
  "createdAt" | "date" | "amount" | "customerName" | "id";

export type FetchBookingsPageParams = {
  q?: string;
  status?: BookingStatus | "All";
  billable?: boolean;
  page?: number;
  pageSize?: number;
  sort?: BookingsSortField;
  order?: "asc" | "desc";
};

export type BookingsPageResponse = {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  meta?: {
    startedCount?: number;
    completedCount?: number;
  };
};
