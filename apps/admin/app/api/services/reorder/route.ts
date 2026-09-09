import { NextResponse } from "next/server";
import { revalidateWebSite } from "@/shared/lib/revalidate-web";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const { updates } = await request.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates array" },
        { status: 400 }
      );
    }

    const transaction = sanityClient.transaction();
    for (const update of updates) {
      if (update.id && typeof update.order === "number") {
        transaction.patch(update.id, (p) => p.set({ order: update.order }));
      }
    }

    await transaction.commit();
    await revalidateWebSite();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder services:", error);
    return NextResponse.json(
      { error: "Failed to reorder services" },
      { status: 500 }
    );
  }
}
