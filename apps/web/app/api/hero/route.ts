import { NextResponse } from "next/server";
import { fetchHeroItems } from "@/features/catalog/sanity";

export async function GET() {
  try {
    const items = await fetchHeroItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch hero items:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero items" },
      { status: 500 }
    );
  }
}
