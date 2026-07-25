import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      
      let patch = sanityClient.patch(existing._id).set(updateData);
      
      if (body.status === "Absent") {
        patch = patch.unset(['checkIn', 'checkOut']);
      } else {
        patch = patch.unset(['reason']);
      }
      
      const res = await patch.commit();
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
    
    revalidatePath('/staff', 'layout');
    return NextResponse.json({ ...body, staffId: id, id: resultId });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return NextResponse.json(
      { error: "Failed to add attendance" },
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
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const existing = await sanityClient.fetch(
      `*[_type == "attendance" && staff._ref == $staffId && date == $date][0]`,
      { staffId: id, date }
    );

    if (existing) {
      await sanityClient.delete(existing._id);
      revalidatePath('/staff', 'layout');
      return NextResponse.json({ success: true, id: existing._id });
    }

    return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance" },
      { status: 500 }
    );
  }
}
