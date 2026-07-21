import { NextResponse } from "next/server";
import { BOOKING_BY_ID_QUERY } from "@/features/bookings/sanity-queries";
import type { BookingService } from "@/features/bookings/types";
import { sanityClient } from "@/shared/lib/sanity/client";

function withKeys(services: BookingService[] | undefined) {
  if (!services) return undefined;
  return services.map((svc, i) => ({ ...svc, _key: `svc-${i}-${svc.name}` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error(`Failed to fetch booking ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { id: _ignore, ...fields } = body;

    const patch: Record<string, unknown> = { ...fields };
    if (fields.services) patch.services = withKeys(fields.services);

    await sanityClient.patch(id).set(patch).commit();
    const updated = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update booking ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await sanityClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete booking ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
