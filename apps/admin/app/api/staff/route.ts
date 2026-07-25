import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";
import { STAFF_QUERY } from "@/features/staff/sanity-queries";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const data = await sanityClient.fetch(STAFF_QUERY, { today });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = {
      _type: "staff",
      ...body,
    };
    const res = await sanityClient.create(doc);
    return NextResponse.json({ ...body, id: res._id });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    );
  }
}
