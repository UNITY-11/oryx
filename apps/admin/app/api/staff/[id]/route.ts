import { NextResponse } from "next/server";
import { STAFF_BY_ID_QUERY } from "@/features/staff/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await sanityClient.fetch(STAFF_BY_ID_QUERY, { id });
    if (!data)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Attendance (and any other docs) hold strong refs to staff and block delete.
    const referencingIds = (await sanityClient.fetch(
      `*[references($staffId)]._id`,
      { staffId: id }
    )) as string[];

    const tx = sanityClient.transaction();
    for (const refId of referencingIds) {
      tx.delete(refId);
    }
    tx.delete(id);
    await tx.commit();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting staff:", error);
    const message =
      error instanceof Error && /references/i.test(error.message)
        ? "Cannot delete this staff member because related records still reference them."
        : "Failed to delete staff member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update the document in Sanity using partial updates
    const updatedStaff = await sanityClient.patch(id).set(body).commit();

    return NextResponse.json(updatedStaff);
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}
