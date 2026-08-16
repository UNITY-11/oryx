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
import { normalizePhone, validateCustomerInput } from "@repo/validation";

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

    const customerError = validateCustomerInput({
      name: body.name ?? "",
      phone: body.phone ?? "",
      email: body.email,
    });
    if (customerError) {
      return NextResponse.json({ error: customerError }, { status: 400 });
    }

    const doc = {
      _type: "customer",
      name: body.name.trim(),
      email: body.email ?? "",
      phone: normalizePhone(body.phone),
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
