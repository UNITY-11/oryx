import { NextResponse } from "next/server";
import type { SocialLink, SocialPlatform } from "@/features/company/types";
import { PROMOTIONAL_BANNER_QUERY } from "@/features/promotional-banner/sanity-queries";
import {
  PROMOTIONAL_BANNER_DOC_ID,
  type PromotionalBannerInput,
} from "@/features/promotional-banner/types";
import {
  hasFieldErrors,
  validatePromotionalBanner,
} from "@/features/promotional-banner/validation";
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
      const platform =
        typeof link.platform === "string" && link.platform.trim()
          ? link.platform.trim()
          : "Other";
      const id =
        typeof link.id === "string" && link.id.trim()
          ? link.id.trim()
          : `social-${index}`;

      if (!url) return null;

      return {
        id,
        platform: platform as SocialPlatform,
        url,
      } satisfies SocialLink;
    })
    .filter((link): link is SocialLink => link !== null);
}

function normalizeInput(body: Record<string, unknown>): PromotionalBannerInput {
  const str = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const status =
    body.status === "Active" || body.status === "Inactive"
      ? body.status
      : "Inactive";

  return {
    title: str("title"),
    description: str("description"),
    image: str("image"),
    status,
    socialLinks: normalizeSocialLinks(body.socialLinks),
  };
}

export async function GET() {
  try {
    const banner = await sanityClient.fetch(PROMOTIONAL_BANNER_QUERY);
    return NextResponse.json({ banner: banner ?? null });
  } catch (error) {
    console.error("Failed to fetch promotional banner:", error);
    return NextResponse.json(
      { error: "Failed to load promotional banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const input = normalizeInput(body);
    const errors = validatePromotionalBanner(input);

    if (hasFieldErrors(errors)) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields", errors },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const doc = {
      _id: PROMOTIONAL_BANNER_DOC_ID,
      _type: "promotionalBanner" as const,
      ...input,
      socialLinks: withKeys<SocialLink>(input.socialLinks),
      updatedAt: now,
    };

    await sanityClient.createOrReplace(doc);
    const saved = await sanityClient.fetch(PROMOTIONAL_BANNER_QUERY);

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Failed to save promotional banner:", error);
    return NextResponse.json(
      { error: "Failed to save promotional banner. Please try again." },
      { status: 500 }
    );
  }
}
