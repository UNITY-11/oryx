import { NextResponse } from "next/server";
import { NOTIFICATION_BY_ID_QUERY } from "@/features/notifications/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const notification = await sanityClient.fetch(NOTIFICATION_BY_ID_QUERY, {
      id,
    });
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(notification);
  } catch (error) {
    console.error(`Failed to fetch notification ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch notification" },
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
    await sanityClient.patch(id).set(fields).commit();
    const updated = await sanityClient.fetch(NOTIFICATION_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update notification ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update notification" },
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
    console.error(`Failed to delete notification ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
