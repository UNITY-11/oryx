import { NextResponse } from "next/server";
import { REVIEWS_LIST_QUERY } from "@/features/reviews/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET() {
  try {
    const reviews = await sanityClient.fetch(REVIEWS_LIST_QUERY);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Reviewer name is required" },
        { status: 400 }
      );
    }

    if (!body.text || typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "review",
      name: body.name,
      text: body.text,
      rating: body.rating ?? 5,
      status: body.status ?? "Active",
      avatar: body.avatar ?? null,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
