import { NextResponse } from "next/server";
import { fetchReviews } from "@/features/catalog/sanity";

export async function GET() {
  try {
    const reviews = await fetchReviews();
    return NextResponse.json(reviews ?? []);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
