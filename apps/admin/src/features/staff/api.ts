import { parseOrThrow } from "@/shared/lib/api-helpers";
import { Staff, AttendanceRecord } from "./types";

export async function fetchStaffList(): Promise<Staff[]> {
  const res = await fetch("/api/staff", { cache: "no-store" });
  return parseOrThrow<Staff[]>(res, "Failed to load staff list");
}

export async function fetchStaffById(id: string): Promise<Staff | null> {
  const res = await fetch(`/api/staff/${id}`, { cache: "no-store" });
  return parseOrThrow<Staff>(res, "Failed to load staff details");
}

export async function fetchAttendance(staffId: string, month?: string): Promise<AttendanceRecord[]> {
  const query = month ? `?month=${month}` : "";
  const res = await fetch(`/api/staff/${staffId}/attendance${query}`, { cache: "no-store" });
  return parseOrThrow<AttendanceRecord[]>(res, "Failed to load attendance");
}

export async function fetchAttendanceReason(id: string): Promise<{ reason?: string }> {
  const res = await fetch(`/api/attendance/${id}/reason`, { cache: "no-store" });
  return parseOrThrow<{ reason?: string }>(res, "Failed to load attendance reason");
}

export async function createStaff(data: Omit<Staff, "id">): Promise<Staff> {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Staff>(res, "Failed to create staff");
}

export async function addAttendance(data: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord> {
  const res = await fetch(`/api/staff/${data.staffId}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow<AttendanceRecord>(res, "Failed to add attendance");
}

export async function updateStaff(id: string, data: Partial<Omit<Staff, "id">>): Promise<Staff> {
  const res = await fetch(`/api/staff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Staff>(res, "Failed to update staff");
}
