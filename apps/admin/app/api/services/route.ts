import { NextResponse } from "next/server";
import {
  buildServicesListQueries,
  SERVICES_LIST_QUERY,
} from "@/features/services/sanity-queries";
import type { ServiceOption } from "@/features/services/types";
import {
  hasServiceFieldErrors,
  normalizeServiceInput,
  validateService,
} from "@/features/services/validation";
import {
  buildPaginatedResponse,
  parsePaginationSearchParams,
  toGroqSearchPattern,
} from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

function withKeys<T extends { id: string }>(
  items: T[] | undefined
): (T & { _key: string })[] {
  return (items ?? []).map((item) => ({ ...item, _key: item.id }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { paginated, page, pageSize, q } =
      parsePaginationSearchParams(searchParams);

    if (!paginated) {
      const services = await sanityClient.fetch(SERVICES_LIST_QUERY);
      return NextResponse.json(services);
    }

    const pattern = toGroqSearchPattern(q);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery, activeCountQuery, inactiveCountQuery } =
      buildServicesListQueries({ q, start, end });

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
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = normalizeServiceInput(body);
    const errors = validateService(input);

    if (hasServiceFieldErrors(errors)) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields", errors },
        { status: 400 }
      );
    }

    const doc = {
      _type: "service",
      name: input.name,
      category: input.name.trim(),
      status: input.status,
      description: input.description,
      shortDescription: input.shortDescription ?? "",
      image: input.image,
      price: input.price ?? 0,
      options: withKeys<ServiceOption>(input.options),
      preparationTime: input.preparationTime ?? 0,
      cleanupTime: input.cleanupTime ?? 0,
      maxCapacity: input.maxCapacity ?? 1,
      tags: input.tags ?? [],
      createdAt: new Date().toISOString().slice(0, 10),
      featured: Boolean(input.featured),
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
