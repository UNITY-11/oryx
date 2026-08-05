import { NextResponse } from "next/server";
import { fetchPromotionalBanner } from "@/features/promotional-banner/sanity";

export async function GET() {
  try {
    const banner = await fetchPromotionalBanner();
    if (!banner?.image?.trim()) {
      return NextResponse.json({ banner: null });
    }
    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Failed to fetch promotional banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotional banner" },
      { status: 500 }
    );
  }
}
