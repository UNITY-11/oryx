import { NextResponse } from "next/server";
import {
  buildProductsListQueries,
  PRODUCTS_LIST_QUERY,
  type ProductsSortField,
} from "@/features/products/sanity-queries";
import type { Product, ProductCategory } from "@/features/products/types";
import {
  firstProductFieldError,
  hasProductFieldErrors,
  isValidProductCategory,
  isValidProductStatus,
  validateProduct,
} from "@/features/products/validation";
import {
  buildPaginatedResponse,
  parsePaginationSearchParams,
  toGroqSearchPattern,
} from "@/shared/lib/pagination";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

function parseProductBody(body: Record<string, unknown>) {
  const status: Product["status"] =
    body.status === "Active" || body.status === "Inactive"
      ? body.status
      : "Active";

  return {
    name: String(body.name ?? ""),
    brand: String(body.brand ?? ""),
    volumeOrWeight: String(body.volumeOrWeight ?? ""),
    quantity: Number(body.quantity ?? 0),
    price: Number(body.price ?? 0),
    category: (body.category ?? "Skincare") as ProductCategory,
    status,
    image: body.image ?? null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { paginated, page, pageSize, q } =
      parsePaginationSearchParams(searchParams);

    if (!paginated) {
      const products = await sanityClient.fetch(PRODUCTS_LIST_QUERY);
      return NextResponse.json(products);
    }

    const category = searchParams.get("category") || "All";
    const sort = (searchParams.get("sort") || "Default") as ProductsSortField;
    const pattern = toGroqSearchPattern(q);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const {
      listQuery,
      countQuery,
      activeCountQuery,
      lowStockCountQuery,
      outOfStockCountQuery,
    } = buildProductsListQueries({ q, category, sort, start, end });

    const queryParams = { q, pattern: pattern || "*", category };

    const [items, total, activeCount, lowStockCount, outOfStockCount] =
      await Promise.all([
        sanityClient.fetch(listQuery, queryParams),
        sanityClient.fetch<number>(countQuery, queryParams),
        sanityClient.fetch<number>(activeCountQuery),
        sanityClient.fetch<number>(lowStockCountQuery),
        sanityClient.fetch<number>(outOfStockCountQuery),
      ]);

    return NextResponse.json(
      buildPaginatedResponse(items, total, page, pageSize, {
        activeCount,
        lowStockCount,
        outOfStockCount,
      })
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = parseProductBody(body);

    if (!isValidProductCategory(parsed.category)) {
      return NextResponse.json(
        {
          error: "Select a valid category",
          fieldErrors: { category: "Select a valid category" },
        },
        { status: 400 }
      );
    }

    if (!isValidProductStatus(parsed.status)) {
      return NextResponse.json(
        {
          error: "Status must be Active or Inactive",
          fieldErrors: { status: "Status must be Active or Inactive" },
        },
        { status: 400 }
      );
    }

    const errors = validateProduct(parsed);
    if (hasProductFieldErrors(errors)) {
      return NextResponse.json(
        {
          error: firstProductFieldError(errors) ?? "Invalid product data",
          fieldErrors: errors,
        },
        { status: 400 }
      );
    }

    const doc = {
      _type: "product",
      name: parsed.name.trim(),
      brand: parsed.brand.trim(),
      volumeOrWeight: parsed.volumeOrWeight.trim(),
      quantity: parsed.quantity,
      price: parsed.price,
      category: parsed.category,
      image: parsed.image,
      status: parsed.status,
    };

    const created = await sanityClient.create(doc);
    return NextResponse.json({ ...doc, id: created._id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
