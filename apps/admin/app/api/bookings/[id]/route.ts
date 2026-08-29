import { NextResponse } from "next/server";
import { BOOKING_BY_ID_QUERY } from "@/features/bookings/sanity-queries";
import type { BookingService } from "@/features/bookings/types";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";
import {
  normalizePhone,
  parseTimeTo24Hour,
  validateBookingPatchFields,
  type CatalogService,
} from "@repo/validation";

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

async function syncCustomerTotalSpent(phone: string | undefined | null) {
  if (!phone) return;

  const customer = await sanityClient.fetch(
    `*[_type == "customer" && phone == $phone][0]{ _id }`,
    { phone }
  );
  if (!customer?._id) return;

  const completed = await sanityClient.fetch(
    `*[_type == "booking" && phone == $phone && status == "Completed"]{ amount }`,
    { phone }
  );

  const totalSpent = (completed as { amount?: number }[]).reduce(
    (sum, b) => sum + (typeof b.amount === "number" ? b.amount : 0),
    0
  );

  await sanityClient.patch(customer._id).set({ totalSpent }).commit();
}

const PATCH_ALLOWED_FIELDS = [
  "customerName",
  "phone",
  "services",
  "date",
  "time",
  "status",
  "amount",
  "membershipId",
  "discountPercent",
  "discountAmount",
  "subtotal",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { id: _ignore, ...rawFields } = body;

    const fields: Record<string, unknown> = {};
    for (const key of PATCH_ALLOWED_FIELDS) {
      if (rawFields[key] !== undefined) {
        fields[key] = rawFields[key];
      }
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const catalog = (await sanityClient.fetch(
      SERVICES_LIST_QUERY
    )) as CatalogService[];

    const patchError = validateBookingPatchFields(fields, { catalog });
    if (patchError) {
      return NextResponse.json({ error: patchError }, { status: 400 });
    }

    const previous = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });
    if (!previous) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = { ...fields };

    if (typeof fields.customerName === "string") {
      patch.customerName = fields.customerName.trim();
    }
    if (typeof fields.phone === "string") {
      patch.phone = normalizePhone(fields.phone);
    }
    if (typeof fields.time === "string") {
      patch.time = parseTimeTo24Hour(fields.time) ?? fields.time;
    }
    if (fields.services) {
      patch.services = withKeys(fields.services as BookingService[]);
    }

    await sanityClient.patch(id).set(patch).commit();
    const updated = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });

    // Recalculate customer spend from Completed bookings only
    const statusChanged =
      fields.status !== undefined && fields.status !== previous?.status;
    if (statusChanged || fields.amount !== undefined) {
      await syncCustomerTotalSpent(updated?.phone || previous?.phone);
    }

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
