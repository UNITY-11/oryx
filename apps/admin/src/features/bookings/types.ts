export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

export interface BookingService {
  name: string;
  options: string[];
}

export interface Booking {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone: string;
  customerId?: string | null;
  services: BookingService[];
  date: string;
  time: string;
  /** Legacy "Started" may exist on old records; not selectable in UI */
  status: BookingStatus | "Started";
  amount: number;
  membershipId?: string;
  discountPercent?: number;
  discountAmount?: number;
  subtotal?: number;
  createdAt?: string;
}

/** Human-readable booking reference for display (invoice, UI). */
export function getBookingDisplayId(
  booking: Pick<Booking, "id" | "bookingCode">
) {
  return booking.bookingCode ?? booking.id;
}
