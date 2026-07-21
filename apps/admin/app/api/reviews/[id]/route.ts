import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";
import { REVIEW_BY_ID_QUERY } from "@/features/reviews/sanity-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await sanityClient.fetch(REVIEW_BY_ID_QUERY, {
      id,
    });
    
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to fetch review:", error);
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Auto-generate initials if not provided but name is changing
    if (body.name && !body.initials) {
      body.initials = body.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    const updated = await sanityClient
      .patch(id)
      .set(body)
      .commit();
      
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sanityClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
