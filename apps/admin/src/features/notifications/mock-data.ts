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

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "Booking",
    title: "New Booking Request",
    message: "Sarah Jenkins requested a 60 min Signature Massage for tomorrow at 2:00 PM.",
    timestamp: "Just now",
    status: "Unread",
    isStarred: false,
    bookingData: {
      customerId: "cust-1",
      customerName: "Sarah Jenkins",
      customerPhone: "+974 5555 1234",
      serviceName: "Signature Massage",
      duration: "60 mins",
      addons: ["Aromatherapy"],
      price: 350,
      date: "Tomorrow, 15 July 2026",
      time: "2:00 PM",
      staffName: "Emma",
      status: "Pending",
    }
  },
  {
    id: "notif-2",
    type: "Stock",
    title: "Low Stock Alert",
    message: "Bamboo Massage Roller is running low. Only 5 items remaining.",
    timestamp: "2 hours ago",
    status: "Unread",
    isStarred: true,
    actionUrl: "/products",
  },
  {
    id: "notif-3",
    type: "Booking",
    title: "New Booking Request",
    message: "Michael Chen requested a Deep Tissue Massage with Hot Stones.",
    timestamp: "4 hours ago",
    status: "Unread",
    isStarred: false,
    bookingData: {
      customerId: "cust-2",
      customerName: "Michael Chen",
      customerPhone: "+974 5555 9876",
      serviceName: "Deep Tissue Massage",
      duration: "90 mins",
      addons: ["Hot Stones", "Extra Scalp Massage"],
      price: 520,
      date: "Friday, 17 July 2026",
      time: "10:30 AM",
      staffName: "David",
      status: "Pending",
    }
  },
  {
    id: "notif-4",
    type: "Stock",
    title: "Out of Stock",
    message: "Collagen Booster Serum is completely out of stock. Please reorder.",
    timestamp: "5 hours ago",
    status: "Read",
];
