import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { NOTIFICATIONS_LIST_QUERY } from "@/features/notifications/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET() {
  try {
    const notifications = await sanityClient.fetch(NOTIFICATIONS_LIST_QUERY);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Notification title is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "notification",
      type: body.type ?? "Booking",
      title: body.title,
      message: body.message ?? "",
      timestamp: body.timestamp ?? "Just now",
      status: body.status ?? "Unread",
      isStarred: body.isStarred ?? false,
      actionUrl: body.actionUrl ?? undefined,
      bookingData: body.bookingData ?? undefined,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
