import { NextResponse } from "next/server";
import { normalizeTo24Hour } from "@/features/booking/availability";
import { sanityWriteClient } from "@/shared/lib/sanity/client";
import { generateNextBookingCode } from "@repo/sanity";
import {
  validateBookingCreateInput,
  type CatalogService,
} from "@repo/validation";
import {
  buildWhatsAppUrl,
  formatCustomerBookingRequestMessage,
  type BookingWhatsAppPayload,
  type CompanyWhatsAppContext,
} from "@repo/whatsapp";

type BookingServiceInput = {
  name: string;
  options?: string[];
};

const COMPANY_CONTEXT_QUERY = `*[_type == "company" && _id == "companyDetails"][0]{
  name,
  phone,
  whatsapp,
  email,
  addressLine1,
  city,
  country
}`;

const SERVICES_CATALOG_QUERY = `*[_type == "service"]{ name, options }`;

const BOOKED_TIMES_QUERY = `*[
  _type == "booking"
  && date == $date
  && status in ["Confirmed", "Started"]
  && count((services[defined(name)].name)[@ in $serviceNames]) > 0
]{ time }`;

async function hasConfirmedSlotConflict(
  date: string,
  time: string,
  names: string[]
): Promise<boolean> {
  if (!date || !time || names.length === 0) return false;
  const rows = (await sanityWriteClient.fetch(BOOKED_TIMES_QUERY, {
    date,
    serviceNames: names,
  })) as { time?: string }[];
  const target = normalizeTo24Hour(time);
  return rows.some((row) => row.time && normalizeTo24Hour(row.time) === target);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const catalog = (await sanityWriteClient.fetch(
      SERVICES_CATALOG_QUERY
    )) as CatalogService[];

    const validated = validateBookingCreateInput(body, {
      rejectPastDates: true,
      catalog,
    });
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const services: BookingServiceInput[] = data.services ?? [];
    const bookedServiceNames = services.map((s) => s.name).filter(Boolean);
    const bookingDate = data.date ?? new Date().toISOString().slice(0, 10);
    const bookingTime = data.time ?? "10:00";

    if (
      await hasConfirmedSlotConflict(
        bookingDate,
        bookingTime,
        bookedServiceNames
      )
    ) {
      return NextResponse.json(
        {
          error:
            "That time is already booked for one of the selected services. Please choose another slot.",
        },
        { status: 409 }
      );
    }

    const existingCustomer = await sanityWriteClient.fetch(
      `*[_type == "customer" && phone == $phone][0]`,
      { phone: data.phone }
    );

    let customerId = existingCustomer?._id;

    if (!customerId && data.phone) {
      const newCustomer = await sanityWriteClient.create({
        _type: "customer",
        name: data.customerName,
        phone: data.phone,
        email: "",
        tier: "Bronze",
        totalSpent: 0,
        lastVisit: bookingDate,
        status: "Active",
      });
      customerId = newCustomer._id;
    }

    const bookingCode = await generateNextBookingCode(sanityWriteClient);

    const servicesWithKeys = services.map((svc, i) => ({
      _key: `svc-${i}-${svc.name}`,
      name: svc.name,
      options: svc.options ?? [],
    }));

    const doc = {
      _type: "booking",
      bookingCode,
      customerName: data.customerName,
      phone: data.phone,
      customerId: customerId ?? null,
      services: servicesWithKeys,
      date: bookingDate,
      time: bookingTime,
      status: "Pending",
      amount: data.amount ?? 0,
    };

    const created = await sanityWriteClient.create(doc);

    const serviceNamesLabel = bookedServiceNames.join(", ");
    const notificationDoc = {
      _type: "notification",
      type: "Booking",
      title: "New Booking Request",
      message: `${data.customerName} requested a booking for ${serviceNamesLabel} on ${bookingDate} at ${bookingTime}.`,
      timestamp: "Just now",
      status: "Unread",
      isStarred: false,
      actionUrl: `/bookings/${created._id}`,
      bookingData: {
        customerId: customerId ?? `cust-${created._id.slice(-5)}`,
        customerName: data.customerName,
        customerPhone: data.phone,
        serviceName: serviceNamesLabel,
        duration: "60 mins",
        options: services.flatMap((s) => s.options ?? []),
        price: data.amount ?? 0,
        date: bookingDate,
        time: bookingTime,
        staffName: "Emma",
        status: "Pending",
      },
    };
    try {
      await sanityWriteClient.create(notificationDoc);
    } catch (notifErr) {
      console.error(
        "Failed to create booking notification in Sanity:",
        notifErr
      );
    }

    const company = (await sanityWriteClient.fetch(
      COMPANY_CONTEXT_QUERY
    )) as CompanyWhatsAppContext | null;

    const whatsappPayload: BookingWhatsAppPayload = {
      id: created._id,
      bookingCode,
      customerName: doc.customerName,
      phone: doc.phone,
      services,
      date: doc.date,
      time: doc.time,
      amount: doc.amount,
      status: "Pending",
    };

    const adminWhatsAppRaw =
      company?.whatsapp?.trim() ||
      process.env.ADMIN_WHATSAPP_FALLBACK?.trim() ||
      "";
    const whatsappMessage = formatCustomerBookingRequestMessage(
      whatsappPayload,
      company ?? undefined
    );
    const whatsappRedirectUrl = adminWhatsAppRaw
      ? buildWhatsAppUrl(adminWhatsAppRaw, whatsappMessage)
      : null;

    return NextResponse.json(
      {
        ...doc,
        id: created._id,
        bookingCode,
        createdAt: created._createdAt,
        whatsappRedirectUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create booking error details:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
