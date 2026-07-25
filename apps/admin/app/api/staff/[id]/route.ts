import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";
import { STAFF_BY_ID_QUERY } from "@/features/staff/sanity-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await sanityClient.fetch(STAFF_BY_ID_QUERY, { id });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
