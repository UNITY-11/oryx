import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";
import { ATTENDANCE_REASON_QUERY } from "@/features/staff/sanity-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await sanityClient.fetch(ATTENDANCE_REASON_QUERY, { id });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching attendance reason:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance reason" },
      { status: 500 }
    );
  }
}
