export type BookingStatus =
  "Confirmed" | "Pending" | "Completed" | "Cancelled" | "Started";

export interface BookingService {
  name: string;
  options: string[];
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  customerId?: string | null;
  services: BookingService[];
  date: string;
  time: string;
  status: BookingStatus;
  amount: number;
}
