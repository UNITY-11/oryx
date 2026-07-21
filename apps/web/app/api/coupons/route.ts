import { NextResponse } from "next/server";
import { fetchCoupons } from "@/features/catalog/sanity";

export async function GET() {
  try {
    const coupons = await fetchCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
