export type NotificationType = "Booking" | "Stock" | "System";
export type NotificationStatus = "Unread" | "Read";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO or relative
  status: NotificationStatus;
  actionUrl?: string;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "Booking",
    title: "New Booking Request",
    message: "Sarah Jenkins requested a 60 min Signature Massage for tomorrow at 2:00 PM.",
    timestamp: "Just now",
    status: "Unread",
    actionUrl: "/bookings",
  },
  {
    id: "notif-2",
    type: "Stock",
    title: "Low Stock Alert",
    message: "Bamboo Massage Roller is running low. Only 5 items remaining.",
    timestamp: "2 hours ago",
    status: "Unread",
    actionUrl: "/products",
  },
  {
    id: "notif-3",
    type: "Stock",
    title: "Out of Stock",
    message: "Collagen Booster Serum is completely out of stock. Please reorder.",
    timestamp: "5 hours ago",
    status: "Read",
    actionUrl: "/products",
  },
  {
    id: "notif-4",
    type: "Booking",
    title: "Booking Cancelled",
    message: "Emma Wilson cancelled her Hydrating Facial appointment scheduled for 10:30 AM.",
    timestamp: "1 day ago",
    status: "Read",
    actionUrl: "/bookings",
  },
  {
    id: "notif-5",
    type: "System",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Sunday at 2:00 AM.",
    timestamp: "2 days ago",
    status: "Read",
  },
];
