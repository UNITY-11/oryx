import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";
import { ATTENDANCE_BY_STAFF_QUERY } from "@/features/staff/sanity-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
    
    const data = await sanityClient.fetch(ATTENDANCE_BY_STAFF_QUERY, { staffId: id, month });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if an attendance record already exists for today
    const existing = await sanityClient.fetch(
      `*[_type == "attendance" && staff._ref == $staffId && date == $date][0]`,
      { staffId: id, date: body.date }
    );

    let resultId;

    if (existing) {
      // Don't overwrite staff reference
      const updateData = { ...body };
      delete updateData.staffId;
      
      const res = await sanityClient.patch(existing._id).set(updateData).commit();
      resultId = res._id;
    } else {
      const doc = {
        _type: "attendance",
        staff: { _type: "reference", _ref: id },
        ...body,
      };
      delete doc.staffId; 
      
      const res = await sanityClient.create(doc);
      resultId = res._id;
    }
    
    return NextResponse.json({ ...body, staffId: id, id: resultId });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return NextResponse.json(
      { error: "Failed to add attendance" },
      { status: 500 }
    );
  }
}
