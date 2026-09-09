export function formatSlotLabel(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function buildTimeSlots(startMin: number, endMin: number): string[] {
  const slots: string[] = [];
  for (let m = startMin; m <= endMin; m += 30) {
    slots.push(formatSlotLabel(m));
  }
  return slots;
}

/** Default hours: 9:00 AM – 9:30 PM. Friday: 3:00 PM – 9:00 PM. */
export function getTimeSlotsForDate(date: Date | null): string[] {
  if (!date) return [];
  const isFriday = date.getDay() === 5;
  if (isFriday) {
    return buildTimeSlots(15 * 60, 21 * 60); // 3:00 PM – 9:00 PM
  }
  return buildTimeSlots(9 * 60, 21 * 60 + 30); // 9:00 AM – 9:30 PM
}

/** @deprecated Use getTimeSlotsForDate — kept for any direct imports. */
export const BOOKING_TIME_SLOTS = buildTimeSlots(9 * 60, 21 * 60 + 30);

export function parseIsoDateLocal(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isPastCalendarDate(date: Date, now = new Date()): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return day < today;
}

export function slotLabelToMinutes(label: string): number | null {
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/** True when the slot is already over for the selected date (or the date itself is past). */
export function isPastTimeSlot(
  slotLabel: string,
  date: Date | null,
  now = new Date()
): boolean {
  if (!date) return true;
  if (isPastCalendarDate(date, now)) return true;
  if (!isSameCalendarDay(date, now)) return false;
  const slotMinutes = slotLabelToMinutes(slotLabel);
  if (slotMinutes == null) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= nowMinutes;
}
