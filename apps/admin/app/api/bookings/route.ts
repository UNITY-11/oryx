import { NextResponse } from "next/server";
import type { BookingService } from "@/features/bookings/mock-data";
import { BOOKINGS_LIST_QUERY } from "@/features/bookings/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

function withKeys(services: BookingService[] | undefined) {
  return (services ?? []).map((svc, i) => ({
    ...svc,
    _key: `svc-${i}-${svc.name}`,
  }));
}

export async function GET() {
  try {
    const bookings = await sanityClient.fetch(BOOKINGS_LIST_QUERY);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.customerName ||
      typeof body.customerName !== "string" ||
      !body.customerName.trim()
    ) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "booking",
      customerName: body.customerName,
      phone: body.phone ?? "",
      services: withKeys(body.services),
      date: body.date ?? new Date().toISOString().slice(0, 10),
      time: body.time ?? "10:00",
      status: body.status ?? "Pending",
      amount: body.amount ?? 0,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
