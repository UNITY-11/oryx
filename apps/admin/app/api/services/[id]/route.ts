import { NextResponse } from "next/server";
import { SERVICE_BY_ID_QUERY } from "@/features/services/sanity-queries";
import { ServiceOption } from "@/features/services/types";
import {
  hasServiceFieldErrors,
  normalizeServiceInput,
  validateService,
} from "@/features/services/validation";
import { sanityClient } from "@/shared/lib/sanity/client";

function withKeys<T extends { id: string }>(
  items: T[] | undefined
): (T & { _key: string })[] | undefined {
  if (!items) return undefined;
  return items.map((item) => ({ ...item, _key: item.id }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const service = await sanityClient.fetch(SERVICE_BY_ID_QUERY, { id });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error(`Failed to fetch service ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const input = normalizeServiceInput(body);
    const errors = validateService(input);

    if (hasServiceFieldErrors(errors)) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields", errors },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      name: input.name,
      category: input.name.trim(),
      status: input.status,
      description: input.description,
      shortDescription: input.shortDescription ?? "",
      image: input.image,
      price: input.price ?? 0,
      options: withKeys<ServiceOption>(input.options),
      preparationTime: input.preparationTime ?? 0,
      cleanupTime: input.cleanupTime ?? 0,
      maxCapacity: input.maxCapacity ?? 1,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
    };

    await sanityClient.patch(id).set(patch).commit();
    const updated = await sanityClient.fetch(SERVICE_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update service ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update service" },
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
    console.error(`Failed to delete service ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
