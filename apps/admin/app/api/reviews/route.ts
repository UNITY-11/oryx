import { NextResponse } from "next/server";
import {
  buildReviewsListQueries,
  REVIEWS_LIST_QUERY,
} from "@/features/reviews/sanity-queries";
import {
  hasReviewFieldErrors,
  validateReview,
} from "@/features/reviews/validation";
import {
  buildPaginatedResponse,
  parsePaginationSearchParams,
  toGroqSearchPattern,
} from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { paginated, page, pageSize, q } =
      parsePaginationSearchParams(searchParams);

    if (!paginated) {
      const reviews = await sanityClient.fetch(REVIEWS_LIST_QUERY);
      return NextResponse.json(reviews ?? []);
    }

    const pattern = toGroqSearchPattern(q);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery, activeCountQuery, inactiveCountQuery } =
      buildReviewsListQueries({ q, start, end });

    const queryParams = { q, pattern: pattern || "*" };

    const [items, total, activeCount, inactiveCount] = await Promise.all([
      sanityClient.fetch(listQuery, queryParams),
      sanityClient.fetch<number>(countQuery, queryParams),
      sanityClient.fetch<number>(activeCountQuery),
      sanityClient.fetch<number>(inactiveCountQuery),
    ]);

    return NextResponse.json(
      buildPaginatedResponse(items, total, page, pageSize, {
        activeCount,
        inactiveCount,
      })
    );
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
    const review = {
      name: body.name ?? "",
      text: body.text ?? "",
      rating: Number(body.rating ?? 5),
      status: (body.status ?? "Active") as "Active" | "Inactive",
    };
    const errors = validateReview(review);
    if (hasReviewFieldErrors(errors)) {
      const first = Object.values(errors).find(Boolean);
      return NextResponse.json(
        { error: first ?? "Invalid review data" },
        { status: 400 }
      );
    }

    let initials = body.initials;
    if (!initials && review.name) {
      initials = review.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    const doc = {
      _type: "review",
      name: review.name.trim(),
      text: review.text.trim(),
      rating: review.rating,
      status: review.status,
      initials: initials,
      avatar: body.avatar ?? null,
      createdAt: new Date().toISOString(),
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
