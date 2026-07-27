"use client";

import { useCallback, useState } from "react";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { useNotifications } from "@features/notifications/api/use-notifications";
import { NotificationsPanel } from "@features/notifications/ui/notifications-panel";

export default function NotificationsPage() {
  const {
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
  } = useNotifications();

  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const handleMarkAllAsRead = async () => {
    const ok = await markAllAsRead();
    setToast(
      ok
        ? { type: "success", message: "All notifications marked as read" }
        : { type: "error", message: "Failed to mark all as read" }
    );
  };

  const handleConfirmBooking = async (id: string) => {
    const ok = await confirmBooking(id);
    setToast(
      ok
        ? { type: "success", message: "Booking confirmed" }
        : { type: "error", message: "Failed to confirm booking" }
    );
  };

  const handleDeclineBooking = async (id: string) => {
    const ok = await declineBooking(id);
    setToast(
      ok
        ? { type: "success", message: "Booking declined" }
        : { type: "error", message: "Failed to decline booking" }
    );
  };

  const handleToggleStar = async (e: React.MouseEvent, id: string) => {
    const notif = filtered.find((n) => n.id === id);
    const wasStarred = Boolean(notif?.isStarred);
    const ok = await toggleStar(e, id);
    if (ok) {
      setToast({
        type: "success",
        message: wasStarred ? "Removed from starred" : "Added to starred",
      });
    } else {
      setToast({ type: "error", message: "Failed to update star" });
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={closeToast} />
      <NotificationsPanel
        loading={loading}
        error={error}
        filter={filter}
        setFilter={setFilter}
        selectedId={selectedId}
        filtered={filtered}
        unreadCount={unreadCount}
        selectedNotif={selectedNotif}
        markAllAsRead={handleMarkAllAsRead}
        handleSelect={handleSelect}
        confirmBooking={handleConfirmBooking}
        declineBooking={handleDeclineBooking}
        toggleStar={handleToggleStar}
        onRetry={reload}
        onBack={clearSelection}
      />
    </>
  );
}
