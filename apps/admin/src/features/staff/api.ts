import { parseOrThrow } from "@/shared/lib/api-helpers";
import {
  buildFetchPageQuery,
  type PaginatedResponse,
} from "@/shared/lib/pagination";

import type {
  Staff,
  StaffHistoryRange,
  StaffServiceHistoryItem,
} from "./types";

export async function fetchStaffList(): Promise<Staff[]> {
  const res = await fetch("/api/staff", { cache: "no-store" });
  return parseOrThrow<Staff[]>(res, "Failed to load staff list");
}

export async function fetchActiveStaffList(): Promise<Staff[]> {
  const res = await fetch("/api/staff?active=1", { cache: "no-store" });
  return parseOrThrow<Staff[]>(res, "Failed to load staff list");
}

export async function fetchStaffPage(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Staff>> {
  const qs = buildFetchPageQuery(params);
  const res = await fetch(`/api/staff?${qs}`, { cache: "no-store" });
  return parseOrThrow(res, "Failed to load staff");
}

export async function fetchStaffById(id: string): Promise<Staff | null> {
  const res = await fetch(`/api/staff/${id}`, { cache: "no-store" });
  return parseOrThrow<Staff>(res, "Failed to load staff details");
}

export async function fetchStaffServiceHistory(
  staffId: string,
  params: {
    range?: StaffHistoryRange;
    from?: string;
    to?: string;
  }
): Promise<StaffServiceHistoryItem[]> {
  const qs = new URLSearchParams();
  if (params.range) qs.set("range", params.range);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const res = await fetch(`/api/staff/${staffId}/history?${qs.toString()}`, {
    cache: "no-store",
  });
  return parseOrThrow<StaffServiceHistoryItem[]>(
    res,
    "Failed to load service history"
  );
}

export async function createStaff(
  data: Omit<Staff, "id" | "imageUrl">
): Promise<Staff> {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Staff>(res, "Failed to create staff");
}

export async function updateStaff(
  id: string,
  data: Partial<Omit<Staff, "id">>
): Promise<Staff> {
  const res = await fetch(`/api/staff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Staff>(res, "Failed to update staff");
}

export async function deleteStaff(id: string): Promise<void> {
  const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(
    res,
    "Failed to delete staff member"
  );
}
