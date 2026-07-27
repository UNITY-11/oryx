import { useCallback, useEffect, useState } from "react";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import { updateBooking } from "../../bookings/api";
import {
  fetchNotifications,
  markAllNotificationsRead,
  updateNotification,
} from "../api";
import { Notification, NotificationType } from "../types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationType | "All" | "Starred">(
    "All"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchNotifications()
      .then((data) => {
        setNotifications(data);
        setSelectedId((prev) => {
          if (prev && data.some((n) => n.id === prev)) return prev;
          return data[0]?.id ?? null;
        });
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load notifications"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useSanityListener('*[_type == "notification"]', reload);

  const filtered = notifications.filter(
    (n) =>
      filter === "All" ||
      (filter === "Starred" ? n.isStarred : n.type === filter)
  );
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;
  const selectedNotif = notifications.find((n) => n.id === selectedId) || null;

  const clearSelection = useCallback(() => setSelectedId(null), []);

  const markAllAsRead = async (): Promise<boolean> => {
    const prev = notifications;
    setNotifications((current) =>
      current.map((n) => ({ ...n, status: "Read" as const }))
    );
    try {
      await markAllNotificationsRead();
      return true;
    } catch {
      setNotifications(prev);
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Read" } : n))
    );
    try {
      await updateNotification(id, { status: "Read" });
    } catch {
      // best-effort
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markAsRead(id);
  };

  const confirmBooking = async (id: string): Promise<boolean> => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif?.bookingData) return false;

    const prev = notifications;
    const bd = notif.bookingData;
    const msg = `Hello ${bd.customerName.split(" ")[0]},\n\nYour booking for ${bd.serviceName} has been confirmed!\n\n📅 Date: ${bd.date}\n⏰ Time: ${bd.time}\n⏳ Duration: ${bd.duration}\n\nWe look forward to welcoming you.\n\nBest regards,\nOryx Spa`;
    const waUrl = `https://wa.me/${bd.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");

    const updatedFields = {
      title: "Booking Confirmed",
      message: `Confirmed ${bd.serviceName} for ${bd.customerName}.`,
      bookingData: { ...bd, status: "Confirmed" as const },
    };
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, ...updatedFields } : n))
    );
    try {
      await updateNotification(id, updatedFields);
      if (notif.actionUrl?.includes("/bookings/")) {
        const bookingId = notif.actionUrl.split("/").pop();
        if (bookingId) {
          await updateBooking(bookingId, { status: "Confirmed" });
        }
      }
      return true;
    } catch {
      setNotifications(prev);
      return false;
    }
  };

  const declineBooking = async (id: string): Promise<boolean> => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif?.bookingData) return false;

    const prev = notifications;
    const updatedFields = {
      title: "Booking Declined",
      message: `Declined ${notif.bookingData.serviceName} for ${notif.bookingData.customerName}.`,
      bookingData: { ...notif.bookingData, status: "Cancelled" as const },
    };
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, ...updatedFields } : n))
    );
    try {
      await updateNotification(id, updatedFields);
      if (notif.actionUrl?.includes("/bookings/")) {
        const bookingId = notif.actionUrl.split("/").pop();
        if (bookingId) {
          await updateBooking(bookingId, { status: "Cancelled" });
        }
      }
      return true;
    } catch {
      setNotifications(prev);
      return false;
    }
  };

  const toggleStar = async (
    e: React.MouseEvent,
    id: string
  ): Promise<boolean> => {
    e.stopPropagation();
    const notif = notifications.find((n) => n.id === id);
    const nextStarred = !notif?.isStarred;
    const prev = notifications;
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isStarred: nextStarred } : n))
    );
    try {
      await updateNotification(id, { isStarred: nextStarred });
      return true;
    } catch {
      setNotifications(prev);
      return false;
    }
  };

  return {
    notifications,
    loading,
    error,
    filter,
    setFilter,
    selectedId,
    filtered,
    unreadCount,
    selectedNotif,
    reload,
    clearSelection,
    markAllAsRead,
    handleSelect,
    confirmBooking,
    declineBooking,
    toggleStar,
  };
}
