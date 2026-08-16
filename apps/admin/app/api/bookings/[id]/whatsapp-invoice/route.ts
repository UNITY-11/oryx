import { NextResponse } from "next/server";
import { getServiceLineItems } from "@/features/billing/invoice-lines";
import { getInvoiceSummary } from "@/features/billing/invoice-summary";
import { BOOKING_BY_ID_QUERY } from "@/features/bookings/sanity-queries";
import type { Booking } from "@/features/bookings/types";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import type { Service } from "@/features/services/types";
import { sanityClient } from "@/shared/lib/sanity/client";
import {
  sendCustomerInvoiceWhatsApp,
  type BookingWhatsAppPayload,
  type CompanyWhatsAppContext,
} from "@repo/whatsapp";

const COMPANY_CONTEXT_QUERY = `*[_type == "company" && _id == "companyDetails"][0]{
  name,
  phone,
  whatsapp,
  email,
  addressLine1,
  city,
  country
}`;

function toWhatsAppPayload(booking: Booking): BookingWhatsAppPayload {
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
    membershipId: booking.membershipId,
    discountPercent: booking.discountPercent,
    discountAmount: booking.discountAmount,
    subtotal: booking.subtotal,
  };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const booking = (await sanityClient.fetch(BOOKING_BY_ID_QUERY, {
      id,
    })) as Booking | null;

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.phone?.replace(/\D/g, "")) {
      return NextResponse.json(
        { error: "Customer phone number is missing" },
        { status: 400 }
      );
    }

    const catalog = (await sanityClient.fetch(
      SERVICES_LIST_QUERY
    )) as Service[];
    const lineItems = getServiceLineItems(booking, catalog);
    const summary = getInvoiceSummary(booking, catalog);

    const company = (await sanityClient.fetch(
      COMPANY_CONTEXT_QUERY
    )) as CompanyWhatsAppContext | null;

    const result = await sendCustomerInvoiceWhatsApp(
      toWhatsAppPayload(booking),
      lineItems,
      summary,
      company ?? undefined
    );

    if (result.text.skipped && result.document.skipped) {
      return NextResponse.json(
        {
          error:
            "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID to your environment.",
          skipped: true,
        },
        { status: 503 }
      );
    }

    const failed = !result.text.ok && !result.text.skipped;
    const documentFailed = !result.document.ok && !result.document.skipped;

    if (failed) {
      return NextResponse.json(
        {
          error: result.text.error ?? "Failed to send WhatsApp message",
          partial: documentFailed ? undefined : result.document.ok,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      textSent: result.text.ok,
      documentSent: result.document.ok,
      documentError: documentFailed ? result.document.error : undefined,
    });
  } catch (error) {
    console.error(`Failed to send invoice WhatsApp for booking ${id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send invoice via WhatsApp",
      },
      { status: 500 }
    );
  }
}
