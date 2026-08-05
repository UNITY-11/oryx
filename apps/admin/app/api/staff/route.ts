import { NextResponse } from "next/server";
import {
  buildStaffListQueries,
  STAFF_QUERY,
} from "@/features/staff/sanity-queries";
import {
  buildPaginatedResponse,
  digitsOnly,
  parsePaginationSearchParams,
  toGroqSearchPattern,
} from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { searchParams } = new URL(request.url);
    const { paginated, page, pageSize, q } =
      parsePaginationSearchParams(searchParams);

    if (!paginated) {
      const data = await sanityClient.fetch(STAFF_QUERY, { today });
      return NextResponse.json(data);
    }

    const phoneDigits = digitsOnly(q);
    const pattern = toGroqSearchPattern(q);
    const phonePattern = phoneDigits.length >= 3 ? `*${phoneDigits}*` : "";
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery } = buildStaffListQueries({
      q,
      phoneDigits,
      start,
      end,
    });

    const queryParams = {
      q,
      pattern: pattern || "*",
      phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
      phonePattern: phonePattern || "*",
      today,
    };

    const [items, total] = await Promise.all([
      sanityClient.fetch(listQuery, queryParams),
      sanityClient.fetch<number>(countQuery, queryParams),
    ]);

    return NextResponse.json(
      buildPaginatedResponse(items, total, page, pageSize)
    );
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = {
      _type: "staff",
      ...body,
    };
    const res = await sanityClient.create(doc);
    return NextResponse.json({ ...body, id: res._id });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    );
  }
}
