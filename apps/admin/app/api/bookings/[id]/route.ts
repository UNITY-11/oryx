import { NextResponse } from "next/server";
import { getInvoiceTotal } from "@/features/billing/invoice-lines";
import { BOOKING_BY_ID_QUERY } from "@/features/bookings/sanity-queries";
import type { BookingService } from "@/features/bookings/types";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import type { Service } from "@/features/services/types";
import { sanityClient } from "@/shared/lib/sanity/client";
import {
  sendCustomerBookingConfirmed,
  type BookingWhatsAppPayload,
  type CompanyWhatsAppContext,
} from "@repo/whatsapp";

function withKeys(services: BookingService[] | undefined) {
  if (!services) return undefined;
  return services.map((svc, i) => ({ ...svc, _key: `svc-${i}-${svc.name}` }));
}

const COMPANY_CONTEXT_QUERY = `*[_type == "company" && _id == "companyDetails"][0]{
  name,
  phone,
  whatsapp,
  email,
  addressLine1,
  city,
  country
}`;

function toWhatsAppPayload(booking: {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone: string;
  services?: BookingService[];
  date: string;
  time: string;
  amount: number;
  status?: string;
}): BookingWhatsAppPayload {
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    customerName: booking.customerName,
    phone: booking.phone,
    services: (booking.services ?? []).map((s) => ({
      name: s.name,
      options: s.options ?? [],
    })),
    date: booking.date,
    time: booking.time,
    amount: booking.amount ?? 0,
    status: booking.status,
    membershipId: (booking as BookingWhatsAppPayload).membershipId,
    discountPercent: (booking as BookingWhatsAppPayload).discountPercent,
    discountAmount: (booking as BookingWhatsAppPayload).discountAmount,
    subtotal: (booking as BookingWhatsAppPayload).subtotal,
  };
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { id: _ignore, ...fields } = body;

    const previous = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });

    const patch: Record<string, unknown> = { ...fields };
    if (fields.services) patch.services = withKeys(fields.services);

    await sanityClient.patch(id).set(patch).commit();
    const updated = await sanityClient.fetch(BOOKING_BY_ID_QUERY, { id });

    // Recalculate customer spend from Completed bookings only
    const statusChanged =
      fields.status !== undefined && fields.status !== previous?.status;
    if (statusChanged || fields.amount !== undefined) {
      await syncCustomerTotalSpent(updated?.phone || previous?.phone);
    }

    const becameConfirmed =
      updated?.status === "Confirmed" && previous?.status !== "Confirmed";

    if (becameConfirmed && updated) {
      try {
        const company = (await sanityClient.fetch(
          COMPANY_CONTEXT_QUERY
        )) as CompanyWhatsAppContext | null;
        const catalog = (await sanityClient.fetch(
          SERVICES_LIST_QUERY
        )) as Service[];
        const catalogSubtotal = getInvoiceTotal(updated, catalog);
        await sendCustomerBookingConfirmed(
          toWhatsAppPayload(updated),
          company ?? undefined,
          catalogSubtotal
        );
      } catch (whatsappErr) {
        console.error(
          "Failed to send customer WhatsApp confirmation:",
          whatsappErr
        );
      }
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
