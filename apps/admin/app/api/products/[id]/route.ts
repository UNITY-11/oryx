import { NextResponse } from "next/server";
import { PRODUCT_BY_ID_QUERY } from "@/features/products/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await sanityClient.fetch(PRODUCT_BY_ID_QUERY, { id });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { id: _ignore, ...fields } = body;
    await sanityClient.patch(id).set(fields).commit();
    const updated = await sanityClient.fetch(PRODUCT_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await sanityClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
