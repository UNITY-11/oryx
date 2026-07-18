import { NextResponse } from "next/server";
import { PRODUCTS_LIST_QUERY } from "@/features/products/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET() {
  try {
    const products = await sanityClient.fetch(PRODUCTS_LIST_QUERY);
    return NextResponse.json(products);
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

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "product",
      name: body.name,
      brand: body.brand ?? "",
      volumeOrWeight: body.volumeOrWeight ?? "",
      quantity: body.quantity ?? 0,
      price: body.price ?? 0,
      category: body.category ?? "Skincare",
      image: body.image ?? null,
      status: body.status ?? "Active",
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
