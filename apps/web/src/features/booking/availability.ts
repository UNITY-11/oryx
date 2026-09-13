/** Normalize stored or UI times to HH:mm (24h) for comparison. */
export function normalizeTo24Hour(time: string): string {
  const value = time.trim();
  const match12 = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12?.[1] && match12[2] && match12[3]) {
    let hours = Number(match12[1]);
    const minutes = match12[2];
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const match24 = value.match(/^(\d{1,2}):(\d{2})$/);
  if (match24?.[1] && match24[2]) {
    return `${String(Number(match24[1])).padStart(2, "0")}:${match24[2]}`;
  }

  return value;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Fetch booked HH:mm times for the given services on a date. */
export async function fetchBookedTimes(
  dateIso: string,
  serviceNames: string[]
): Promise<string[]> {
  const names = serviceNames.map((n) => n.trim()).filter(Boolean);
  if (!dateIso || names.length === 0) return [];

  const params = new URLSearchParams({ date: dateIso });
  for (const name of names) {
    params.append("service", name);
  }

  const res = await fetch(`/api/availability?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to load availability");
  }

  const data = (await res.json()) as { bookedTimes?: string[] };
  return (data.bookedTimes ?? []).map(normalizeTo24Hour);
}
