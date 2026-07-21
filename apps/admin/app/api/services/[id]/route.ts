import { NextResponse } from "next/server";
import { SERVICE_BY_ID_QUERY } from "@/features/services/sanity-queries";
import type { Addon, PricingTier } from "@/features/services/types";
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
    const { id: _ignore, ...fields } = body;

    const patch: Record<string, unknown> = { ...fields };
    if (fields.pricingTiers)
      patch.pricingTiers = withKeys<PricingTier>(fields.pricingTiers);
    if (fields.addons) patch.addons = withKeys<Addon>(fields.addons);

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
