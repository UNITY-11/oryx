import type { BookingWhatsAppPayload } from "./types";

export function toBookingWhatsAppPayload(booking: {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone: string;
  services?: { name: string; options?: string[] }[];
  date: string;
  time: string;
  amount: number;
  status?: string;
  membershipId?: string;
  discountPercent?: number;
  discountAmount?: number;
  subtotal?: number;
}): BookingWhatsAppPayload {
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    customerName: booking.customerName,
    phone: booking.phone,
    services: (booking.services ?? []).map((s) => ({
      name: s.name,
      options: s.options ?? [],
    })),
    date: booking.date,
    time: booking.time,
    amount: booking.amount ?? 0,
    status: booking.status,
    membershipId: booking.membershipId,
    discountPercent: booking.discountPercent,
    discountAmount: booking.discountAmount,
    subtotal: booking.subtotal,
  };
}
