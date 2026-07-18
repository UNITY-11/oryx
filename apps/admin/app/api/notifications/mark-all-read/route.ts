import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function POST() {
  try {
    const unreadIds: string[] = await sanityClient.fetch(
      `*[_type == "notification" && status == "Unread"]._id`
    );
    if (unreadIds.length > 0) {
      const tx = sanityClient.transaction();
      for (const id of unreadIds) {
        tx.patch(id, (p) => p.set({ status: "Read" }));
      }
      await tx.commit();
    }
    return NextResponse.json({ success: true, updated: unreadIds.length });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    );
  }
}
