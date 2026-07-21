import { NextResponse } from "next/server";
import { HERO_BY_ID_QUERY } from "@/features/hero/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await sanityClient.fetch(HERO_BY_ID_QUERY, { id });
    if (!item) {
      return NextResponse.json({ error: "Hero item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to fetch hero item:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const patch = { ...body };
    delete patch.id;
    delete patch._id;
    delete patch.createdAt;

    await sanityClient.patch(id).set(patch).commit();
    const updated = await sanityClient.fetch(HERO_BY_ID_QUERY, { id });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update hero item:", error);
    return NextResponse.json(
      { error: "Failed to update hero item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sanityClient.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete hero item:", error);
    return NextResponse.json(
      { error: "Failed to delete hero item" },
      { status: 500 }
    );
  }
}
