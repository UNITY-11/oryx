import { NextResponse } from "next/server";
import { COMPANY_QUERY } from "@/features/company/sanity-queries";
import {
  COMPANY_DOC_ID,
  SOCIAL_PLATFORMS,
  type CompanyInput,
  type SocialLink,
  type SocialPlatform,
} from "@/features/company/types";
import { hasFieldErrors, validateCompany } from "@/features/company/validation";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

function withKeys<T extends { id: string }>(
  items: T[] | undefined
): (T & { _key: string })[] {
  return (items ?? []).map((item) => ({ ...item, _key: item.id }));
}

function normalizeSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const link = item as Record<string, unknown>;
      const url = typeof link.url === "string" ? link.url.trim() : "";
      const rawPlatform =
        typeof link.platform === "string" ? link.platform.trim() : "";
      const platform: SocialPlatform = SOCIAL_PLATFORMS.includes(
        rawPlatform as SocialPlatform
      )
        ? (rawPlatform as SocialPlatform)
        : "Other";

      const id =
        typeof link.id === "string" && link.id.trim()
          ? link.id.trim()
          : `social-${index}`;

      if (!url) return null;

      return { id, platform, url } satisfies SocialLink;
    })
    .filter((link): link is SocialLink => link !== null);
}

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
    socialLinks: normalizeSocialLinks(body.socialLinks),
    addressLine1: str("addressLine1"),
    addressLine2: str("addressLine2"),
    city: str("city"),
    state: str("state"),
    country: str("country"),
    postalCode: str("postalCode"),
    mapUrl: str("mapUrl"),
    mapEmbedUrl: str("mapEmbedUrl"),
    gymMembershipDiscountPercent: (() => {
      const raw = body.gymMembershipDiscountPercent;
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "string" && raw.trim() !== "") {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    })(),
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
      socialLinks: withKeys<SocialLink>(input.socialLinks),
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
