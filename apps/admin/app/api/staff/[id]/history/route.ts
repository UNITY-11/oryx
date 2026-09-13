import { NextResponse } from "next/server";
import { STAFF_SERVICE_HISTORY_QUERY } from "@/features/staff/sanity-queries";
import {
  getStaffHistoryDateRange,
  type StaffHistoryRange,
  type StaffServiceHistoryItem,
} from "@/features/staff/types";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

const RANGES: StaffHistoryRange[] = [
  "today",
  "week",
  "month",
  "year",
  "custom",
];

type HistoryRow = {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone?: string;
  date: string;
  time: string;
  status: string;
  matchedServices?: { name: string; options?: string[] }[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const rangeParam = (searchParams.get("range") ||
      "month") as StaffHistoryRange;
    const range = RANGES.includes(rangeParam) ? rangeParam : "month";
    const customFrom = searchParams.get("from") ?? undefined;
    const customTo = searchParams.get("to") ?? undefined;

    const { from, to } = getStaffHistoryDateRange(range, customFrom, customTo);

    const rows = (await sanityClient.fetch(STAFF_SERVICE_HISTORY_QUERY, {
      staffId: id,
      from,
      to,
    })) as HistoryRow[];

    const items: StaffServiceHistoryItem[] = [];
    for (const row of rows) {
      for (const svc of row.matchedServices ?? []) {
        items.push({
          id: `${row.id}::${svc.name}`,
          bookingId: row.id,
          bookingCode: row.bookingCode,
          customerName: row.customerName,
          phone: row.phone,
          date: row.date,
          time: row.time,
          status: row.status,
          serviceName: svc.name,
          options: svc.options ?? [],
        });
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching staff service history:", error);
    return NextResponse.json(
      { error: "Failed to fetch service history" },
      { status: 500 }
    );
  }
}
