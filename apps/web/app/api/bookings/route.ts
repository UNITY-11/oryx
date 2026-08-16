import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/shared/lib/sanity/client";
import { generateNextBookingCode } from "@repo/sanity";
import {
  validateBookingCreateInput,
  type CatalogService,
} from "@repo/validation";
import {
  sendAdminNewBookingAlert,
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
        lastVisit: data.date ?? new Date().toISOString().slice(0, 10),
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
      date: data.date ?? new Date().toISOString().slice(0, 10),
      time: data.time ?? "10:00",
      status: "Pending",
      amount: data.amount ?? 0,
    };

    const created = await sanityWriteClient.create(doc);

    const serviceNames = services.map((s) => s.name).join(", ");
    const notificationDoc = {
      _type: "notification",
      type: "Booking",
      title: "New Booking Request",
      message: `${data.customerName} requested a booking for ${serviceNames} on ${data.date ?? new Date().toISOString().slice(0, 10)} at ${data.time ?? "10:00"}.`,
      timestamp: "Just now",
      status: "Unread",
      isStarred: false,
      actionUrl: `/bookings/${created._id}`,
      bookingData: {
        customerId: customerId ?? `cust-${created._id.slice(-5)}`,
        customerName: data.customerName,
        customerPhone: data.phone,
        serviceName: serviceNames,
        duration: "60 mins",
        options: services.flatMap((s) => s.options ?? []),
        price: data.amount ?? 0,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        time: data.time ?? "10:00",
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

    try {
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

      await sendAdminNewBookingAlert(whatsappPayload, company ?? undefined);
    } catch (whatsappErr) {
      console.error("Failed to send admin WhatsApp alert:", whatsappErr);
    }

    return NextResponse.json(
      { ...doc, id: created._id, bookingCode, createdAt: created._createdAt },
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
