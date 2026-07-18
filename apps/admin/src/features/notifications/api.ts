import type { Notification } from "./mock-data";

async function parseOrThrow<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? fallbackMessage);
  }
  return res.json();
}

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
