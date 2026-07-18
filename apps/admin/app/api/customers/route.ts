import { NextResponse } from "next/server";
import { CUSTOMERS_LIST_QUERY } from "@/features/customers/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET() {
  try {
    const customers = await sanityClient.fetch(CUSTOMERS_LIST_QUERY);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "customer",
      name: body.name,
      email: body.email ?? "",
      phone: body.phone ?? "",
      avatar: body.avatar ?? null,
      tier: body.tier ?? "Bronze",
      totalSpent: body.totalSpent ?? 0,
      lastVisit: body.lastVisit ?? new Date().toISOString().slice(0, 10),
      status: body.status ?? "Active",
      age: body.age ?? undefined,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
