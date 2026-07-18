import { NextResponse } from "next/server";
import { fetchCatalogItems } from "@/features/catalog/sanity";

export async function GET() {
  try {
    const items = await fetchCatalogItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
