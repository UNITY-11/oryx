export type NotificationType = "Booking" | "Stock";
export type NotificationStatus = "Unread" | "Read";

export interface BookingPayload {
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  duration: string;
  addons: string[];
  price: number;
  date: string;
  time: string;
  staffName: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  isStarred?: boolean;
  actionUrl?: string;
  bookingData?: BookingPayload;
}
