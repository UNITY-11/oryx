import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/shared/lib/sanity/client";
import { generateNextBookingCode } from "@repo/sanity";
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

    const services: BookingServiceInput[] = Array.isArray(body.services)
      ? body.services
      : [];
    const servicesWithKeys = services.map((svc, i) => ({
      _key: `svc-${i}-${svc.name}`,
      name: svc.name,
      options: svc.options ?? [],
    }));

    const existingCustomer = await sanityWriteClient.fetch(
      `*[_type == "customer" && phone == $phone][0]`,
      { phone: body.phone || "" }
    );

    let customerId = existingCustomer?._id;

    if (!customerId && body.phone) {
      const newCustomer = await sanityWriteClient.create({
        _type: "customer",
        name: body.customerName.trim(),
        phone: body.phone,
        email: "",
        tier: "Bronze",
        totalSpent: 0,
        lastVisit: body.date ?? new Date().toISOString().slice(0, 10),
        status: "Active",
      });
      customerId = newCustomer._id;
    }

    const bookingCode = await generateNextBookingCode(sanityWriteClient);

    const doc = {
      _type: "booking",
      bookingCode,
      customerName: body.customerName.trim(),
      phone: body.phone ?? "",
      customerId: customerId ?? null,
      services: servicesWithKeys,
      date: body.date ?? new Date().toISOString().slice(0, 10),
      time: body.time ?? "10:00",
      status: "Pending",
      amount: body.amount ?? 0,
    };

    const created = await sanityWriteClient.create(doc);

    const serviceNames = services.map((s) => s.name).join(", ");
    const notificationDoc = {
      _type: "notification",
      type: "Booking",
      title: "New Booking Request",
      message: `${body.customerName.trim()} requested a booking for ${serviceNames} on ${body.date ?? new Date().toISOString().slice(0, 10)} at ${body.time ?? "10:00"}.`,
      timestamp: "Just now",
      status: "Unread",
      isStarred: false,
      actionUrl: `/bookings/${created._id}`,
      bookingData: {
        customerId: customerId ?? `cust-${created._id.slice(-5)}`,
        customerName: body.customerName.trim(),
        customerPhone: body.phone ?? "",
        serviceName: serviceNames,
        duration: "60 mins",
        options: services.flatMap((s) => s.options ?? []),
        price: body.amount ?? 0,
        date: body.date ?? new Date().toISOString().slice(0, 10),
        time: body.time ?? "10:00",
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
