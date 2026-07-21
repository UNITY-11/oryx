"use client";

import { useNotifications } from "../../src/features/notifications/api/use-notifications";
import { NotificationsPanel } from "../../src/features/notifications/ui/notifications-panel";

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
    markAllAsRead,
    handleSelect,
    confirmBooking,
    declineBooking,
    toggleStar,
  } = useNotifications();

  return (
    <NotificationsPanel
      loading={loading}
      error={error}
      filter={filter}
      setFilter={setFilter}
      selectedId={selectedId}
      filtered={filtered}
      unreadCount={unreadCount}
      selectedNotif={selectedNotif}
      markAllAsRead={markAllAsRead}
      handleSelect={handleSelect}
      confirmBooking={confirmBooking}
      declineBooking={declineBooking}
      toggleStar={toggleStar}
    />
  );
}
