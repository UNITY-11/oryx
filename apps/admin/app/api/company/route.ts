import { NextResponse } from "next/server";
import { COMPANY_QUERY } from "@/features/company/sanity-queries";
import { COMPANY_DOC_ID, type CompanyInput } from "@/features/company/types";
import { hasFieldErrors, validateCompany } from "@/features/company/validation";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

function normalizeInput(body: Record<string, unknown>): CompanyInput {
  const str = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : "";

  return {
    name: str("name"),
    tagline: str("tagline"),
    email: str("email"),
    phone: str("phone"),
    whatsapp: str("whatsapp"),
    website: str("website"),
    addressLine1: str("addressLine1"),
    addressLine2: str("addressLine2"),
    city: str("city"),
    state: str("state"),
    country: str("country"),
    postalCode: str("postalCode"),
    mapUrl: str("mapUrl"),
    mapEmbedUrl: str("mapEmbedUrl"),
  };
}

export async function GET() {
  try {
    const company = await sanityClient.fetch(COMPANY_QUERY);
    return NextResponse.json({ company: company ?? null });
  } catch (error) {
    console.error("Failed to fetch company details:", error);
    return NextResponse.json(
      { error: "Failed to load company details" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const input = normalizeInput(body);
    const errors = validateCompany(input);

    if (hasFieldErrors(errors)) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields", errors },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const doc = {
      _id: COMPANY_DOC_ID,
      _type: "company" as const,
      ...input,
      updatedAt: now,
    };

    await sanityClient.createOrReplace(doc);
    const saved = await sanityClient.fetch(COMPANY_QUERY);

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Failed to save company details:", error);
    return NextResponse.json(
      { error: "Failed to save company details. Please try again." },
      { status: 500 }
    );
  }
}
