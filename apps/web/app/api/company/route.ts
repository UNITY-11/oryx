import { NextResponse } from "next/server";
import { fetchCompany } from "@/features/company/sanity";

export async function GET() {
  try {
    const company = await fetchCompany();
    return NextResponse.json({ company: company ?? null });
  } catch (error) {
    console.error("Failed to fetch company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
