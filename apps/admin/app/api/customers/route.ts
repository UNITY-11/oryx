import { NextResponse } from "next/server";
import {
  buildCustomersListQueries,
  CUSTOMERS_LIST_QUERY,
} from "@/features/customers/sanity-queries";
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
    const { searchParams } = new URL(request.url);
    const { paginated, page, pageSize, q } =
      parsePaginationSearchParams(searchParams);

    if (!paginated) {
      const customers = await sanityClient.fetch(CUSTOMERS_LIST_QUERY);
      return NextResponse.json(customers);
    }

    const tier = searchParams.get("tier") || "All";
    const phoneDigits = digitsOnly(q);
    const pattern = toGroqSearchPattern(q);
    const phonePattern = phoneDigits.length >= 3 ? `*${phoneDigits}*` : "";
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery, activeCountQuery, inactiveCountQuery } =
      buildCustomersListQueries({ q, phoneDigits, tier, start, end });

    const queryParams = {
      q,
      pattern: pattern || "*",
      phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
      phonePattern: phonePattern || "*",
      tier,
    };

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
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "customer",
      name: body.name,
      email: body.email ?? "",
      phone: body.phone ?? "",
      avatar: body.avatar ?? null,
      tier: body.tier ?? "Bronze",
      totalSpent: body.totalSpent ?? 0,
      lastVisit: body.lastVisit ?? new Date().toISOString().slice(0, 10),
      status: body.status ?? "Active",
      age: body.age ?? undefined,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
