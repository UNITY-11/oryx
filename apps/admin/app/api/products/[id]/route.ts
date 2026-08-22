import { NextResponse } from "next/server";
import { PRODUCT_BY_ID_QUERY } from "@/features/products/sanity-queries";
import type { Product } from "@/features/products/types";
import {
  firstProductFieldError,
  hasProductFieldErrors,
  isValidProductCategory,
  isValidProductStatus,
  productToFormData,
  validateProduct,
} from "@/features/products/validation";
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
    const existing = await sanityClient.fetch<Product | null>(
      PRODUCT_BY_ID_QUERY,
      { id }
    );
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id: _ignore, ...fields } = body;

    const merged = {
      ...productToFormData(existing),
      ...fields,
      name: fields.name !== undefined ? String(fields.name) : existing.name,
      brand: fields.brand !== undefined ? String(fields.brand) : existing.brand,
      volumeOrWeight:
        fields.volumeOrWeight !== undefined
          ? String(fields.volumeOrWeight)
          : existing.volumeOrWeight,
      quantity:
        fields.quantity !== undefined
          ? Number(fields.quantity)
          : existing.quantity,
      price: fields.price !== undefined ? Number(fields.price) : existing.price,
      category:
        fields.category !== undefined
          ? (fields.category as Product["category"])
          : existing.category,
      status:
        fields.status !== undefined
          ? (fields.status as Product["status"])
          : existing.status,
    };

    if (
      fields.category !== undefined &&
      !isValidProductCategory(merged.category)
    ) {
      return NextResponse.json(
        {
          error: "Select a valid category",
          fieldErrors: { category: "Select a valid category" },
        },
        { status: 400 }
      );
    }

    if (fields.status !== undefined && !isValidProductStatus(merged.status)) {
      return NextResponse.json(
        {
          error: "Status must be Active or Inactive",
          fieldErrors: { status: "Status must be Active or Inactive" },
        },
        { status: 400 }
      );
    }

    const errors = validateProduct(merged);
    if (hasProductFieldErrors(errors)) {
      return NextResponse.json(
        {
          error: firstProductFieldError(errors) ?? "Invalid product data",
          fieldErrors: errors,
        },
        { status: 400 }
      );
    }

    const patch = {
      name: merged.name.trim(),
      brand: merged.brand.trim(),
      volumeOrWeight: merged.volumeOrWeight.trim(),
      quantity: merged.quantity,
      price: merged.price,
      category: merged.category,
      status: merged.status,
      ...(fields.image !== undefined ? { image: fields.image } : {}),
    };

    await sanityClient.patch(id).set(patch).commit();
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
