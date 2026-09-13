import { NextResponse } from "next/server";
import { normalizeTo24Hour } from "@/features/booking/availability";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

const BOOKED_TIMES_QUERY = `*[
  _type == "booking"
  && date == $date
  && status in ["Confirmed", "Started"]
  && count((services[defined(name)].name)[@ in $serviceNames]) > 0
]{ time }`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() ?? "";
    const serviceNames = searchParams
      .getAll("service")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date (YYYY-MM-DD) is required" },
        { status: 400 }
      );
    }

    if (serviceNames.length === 0) {
      return NextResponse.json({ bookedTimes: [] });
    }

    const rows = (await sanityClient.fetch(BOOKED_TIMES_QUERY, {
      date,
      serviceNames,
    })) as { time?: string }[];

    const bookedTimes = Array.from(
      new Set(
        rows
          .map((row) => (row.time ? normalizeTo24Hour(row.time) : ""))
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ bookedTimes });
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
