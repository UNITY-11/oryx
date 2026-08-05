import { NextResponse } from "next/server";
import {
  buildCouponsListQueries,
  GET_ALL_COUPONS_QUERY,
} from "@/features/coupons/sanity-queries";
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
      const items = await sanityClient.fetch(GET_ALL_COUPONS_QUERY);
      return NextResponse.json(items);
    }

    const pattern = toGroqSearchPattern(q);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery } = buildCouponsListQueries({
      q,
      start,
      end,
    });

    const queryParams = { q, pattern: pattern || "*" };

    const [items, total] = await Promise.all([
      sanityClient.fetch(listQuery, queryParams),
      sanityClient.fetch<number>(countQuery, queryParams),
    ]);

    return NextResponse.json(
      buildPaginatedResponse(items, total, page, pageSize)
    );
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = {
      _type: "coupon",
      ...body,
      createdAt: new Date().toISOString(),
    };
    const created = await sanityClient.create(doc);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
