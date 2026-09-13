export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  baseSalary?: number;
  status: "Active" | "Inactive";
  imageUrl?: string;
  joinedDate: string;
}

export type StaffHistoryRange = "today" | "week" | "month" | "year" | "custom";

export interface StaffServiceHistoryItem {
  id: string;
  bookingId: string;
  bookingCode?: string;
  customerName: string;
  phone?: string;
  date: string;
  time: string;
  status: string;
  serviceName: string;
  options: string[];
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Resolve from/to ISO dates for staff service history filters. */
export function getStaffHistoryDateRange(
  range: StaffHistoryRange,
  customFrom?: string,
  customTo?: string
): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = toIsoDate(today);

  if (range === "custom") {
    const from = customFrom?.trim() || to;
    const end = customTo?.trim() || to;
    return from <= end ? { from, to: end } : { from: end, to: from };
  }

  if (range === "today") {
    return { from: to, to };
  }

  if (range === "week") {
    const day = today.getDay(); // 0 Sun
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + mondayOffset);
    return { from: toIsoDate(start), to };
  }

  if (range === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toIsoDate(start), to };
  }

  // year
  const start = new Date(today.getFullYear(), 0, 1);
  return { from: toIsoDate(start), to };
}
