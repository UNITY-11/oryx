import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/shared/lib/sanity/client";

type BookingServiceInput = {
  name: string;
  addons?: string[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/bookings payload:", body);

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
      addons: svc.addons ?? [],
    }));

    const doc = {
      _type: "booking",
      customerName: body.customerName.trim(),
      phone: body.phone ?? "",
      services: servicesWithKeys,
      date: body.date ?? new Date().toISOString().slice(0, 10),
      time: body.time ?? "10:00",
      status: "Pending",
      amount: body.amount ?? 0,
    };

    const created = await sanityWriteClient.create(doc);

    // Create corresponding notification document in Sanity
    const serviceNames = services.map((s) => s.name).join(", ");
    const notificationDoc = {
      _type: "notification",
      type: "Booking",
      title: "New Booking Request",
      message: `${body.customerName.trim()} requested a booking for ${serviceNames} on ${body.date ?? new Date().toISOString().slice(0, 10)} at ${body.time ?? "10:00"}.`,
      timestamp: "Just now",
      status: "Unread",
      isStarred: false,
      bookingData: {
        customerId: `cust-${created._id.slice(-5)}`,
        customerName: body.customerName.trim(),
        customerPhone: body.phone ?? "",
        serviceName: serviceNames,
        duration: "60 mins",
        addons: services.flatMap((s) => s.addons ?? []),
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
      console.error("Failed to create booking notification in Sanity:", notifErr);
      // Don't fail the booking request if only the notification creation fails
    }

    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking error details:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
