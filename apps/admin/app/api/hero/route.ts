import { NextResponse } from "next/server";
import { HERO_LIST_QUERY } from "@/features/hero/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET() {
  try {
    const items = await sanityClient.fetch(HERO_LIST_QUERY);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch hero items:", error);
    return NextResponse.json({ error: "Failed to fetch hero items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = {
      _type: "hero",
      ...body,
      createdAt: new Date().toISOString(),
    };
    const created = await sanityClient.create(doc);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create hero item:", error);
    return NextResponse.json({ error: "Failed to create hero item" }, { status: 500 });
  }
}
