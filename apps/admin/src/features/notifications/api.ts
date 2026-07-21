import type { Notification } from "./mock-data";
import { parseOrThrow } from "@/shared/lib/api-helpers";

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications", { cache: "no-store" });
  return parseOrThrow<Notification[]>(res, "Failed to load notifications");
}

export async function updateNotification(
  id: string,
  payload: Partial<Notification>
): Promise<Notification> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Notification>(res, "Failed to update notification");
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch("/api/notifications/mark-all-read", {
    method: "POST",
  });
  await parseOrThrow<{ success: boolean }>(res, "Failed to mark all as read");
}
