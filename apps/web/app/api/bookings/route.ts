import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/shared/lib/sanity/client";

type BookingServiceInput = {
  name: string;
  addons?: string[];
};

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
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
