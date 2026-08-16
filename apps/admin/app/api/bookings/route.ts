import { NextResponse } from "next/server";
import {
  BOOKINGS_LIST_QUERY,
  buildBookingsListQueries,
  toGroqSearchPattern,
} from "@/features/bookings/sanity-queries";
import type { BookingService } from "@/features/bookings/types";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import {
  buildPaginatedResponse,
  parsePaginationSearchParams,
} from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";
import { generateNextBookingCode } from "@repo/sanity";
import {
  validateBookingCreateInput,
  type CatalogService,
} from "@repo/validation";

export const dynamic = "force-dynamic";

function withKeys(services: BookingService[] | undefined) {
  return (services ?? []).map((svc, i) => ({
    ...svc,
    _key: `svc-${i}-${svc.name}`,
  }));
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paginated = searchParams.get("paginated") === "1";

    if (!paginated) {
      const bookings = await sanityClient.fetch(BOOKINGS_LIST_QUERY);
      return NextResponse.json(bookings);
    }

    const { page, pageSize, q } = parsePaginationSearchParams(searchParams);
    const status = searchParams.get("status") || "All";
    const billable = searchParams.get("billable") === "1";
    const sort = (searchParams.get("sort") || "createdAt") as
      "createdAt" | "date" | "amount" | "customerName" | "id";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const phoneDigits = digitsOnly(q);
    const pattern = toGroqSearchPattern(q);
    const phonePattern = phoneDigits.length >= 3 ? `*${phoneDigits}*` : "";

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { listQuery, countQuery, startedCountQuery, completedCountQuery } =
      buildBookingsListQueries({
        q,
        phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
        status,
        billable,
        sort,
        order,
        start,
        end,
      });

    const queryParams = {
      q,
      pattern: pattern || "*",
      phoneDigits: phoneDigits.length >= 3 ? phoneDigits : "",
      phonePattern: phonePattern || "*",
      status,
      billable,
    };

    const fetches: Promise<unknown>[] = [
      sanityClient.fetch(listQuery, queryParams),
      sanityClient.fetch<number>(countQuery, queryParams),
    ];
    if (billable) {
      fetches.push(sanityClient.fetch<number>(startedCountQuery));
      fetches.push(sanityClient.fetch<number>(completedCountQuery));
    }

    const results = await Promise.all(fetches);
    const items = results[0];
    const total = results[1] as number;

    const meta = billable
      ? {
          startedCount: results[2] as number,
          completedCount: results[3] as number,
        }
      : undefined;

    return NextResponse.json(
      buildPaginatedResponse(items as unknown[], total, page, pageSize, meta)
    );
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const catalog = (await sanityClient.fetch(
      SERVICES_LIST_QUERY
    )) as CatalogService[];

    const validated = validateBookingCreateInput(body, { catalog });
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const services = data.services ?? [];

    const existingCustomer = await sanityClient.fetch(
      `*[_type == "customer" && phone == $phone][0]`,
      { phone: data.phone }
    );

    let customerId = existingCustomer?._id;

    if (!customerId && data.phone) {
      const isCompleted = body.status === "Completed";
      const newCustomer = await sanityClient.create({
        _type: "customer",
        name: data.customerName,
        phone: data.phone,
        email: "",
        tier: "Bronze",
        totalSpent: isCompleted ? (data.amount ?? 0) : 0,
        lastVisit: data.date ?? new Date().toISOString().slice(0, 10),
        status: "Active",
      });
      customerId = newCustomer._id;
    } else if (customerId && body.status === "Completed") {
      const completed = await sanityClient.fetch(
        `*[_type == "booking" && phone == $phone && status == "Completed"]{ amount }`,
        { phone: data.phone }
      );
      const priorSpent = (completed as { amount?: number }[]).reduce(
        (sum, b) => sum + (typeof b.amount === "number" ? b.amount : 0),
        0
      );
      await sanityClient
        .patch(customerId)
        .set({
          totalSpent: priorSpent + (data.amount ?? 0),
          lastVisit: data.date ?? new Date().toISOString().slice(0, 10),
        })
        .commit();
    }

    const bookingCode = await generateNextBookingCode(sanityClient);

    const doc = {
      _type: "booking",
      bookingCode,
      customerName: data.customerName,
      phone: data.phone,
      customerId: customerId ?? null,
      services: withKeys(services as BookingService[]),
      date: data.date ?? new Date().toISOString().slice(0, 10),
      time: data.time ?? "10:00",
      status: body.status ?? "Pending",
      amount: data.amount ?? 0,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json(
      {
        ...doc,
        id: created._id,
        bookingCode,
        createdAt: created._createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
