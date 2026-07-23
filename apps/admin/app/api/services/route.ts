import { NextResponse } from "next/server";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import type { ServiceOption } from "@/features/services/types";
import { sanityClient } from "@/shared/lib/sanity/client";

function withKeys<T extends { id: string }>(
  items: T[] | undefined
): (T & { _key: string })[] {
  return (items ?? []).map((item) => ({ ...item, _key: item.id }));
}

export async function GET() {
  try {
    const services = await sanityClient.fetch(SERVICES_LIST_QUERY);
    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "service",
      name: body.name,
      category: body.category ?? "Massage",
      status: body.status ?? "Active",
      description: body.description ?? "",
      shortDescription: body.shortDescription ?? "",
      image: body.image ?? null,
      price: body.price,
      options: withKeys<ServiceOption>(body.options),
      preparationTime: body.preparationTime ?? 0,
      cleanupTime: body.cleanupTime ?? 0,
      maxCapacity: body.maxCapacity ?? 1,
      tags: body.tags ?? [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
