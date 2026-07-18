import { NextResponse } from "next/server";
import { CUSTOMER_BY_ID_QUERY } from "@/features/customers/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const customer = await sanityClient.fetch(CUSTOMER_BY_ID_QUERY, { id });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(customer);
  } catch (error) {
    console.error(`Failed to fetch customer ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
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
    const updated = await sanityClient.fetch(CUSTOMER_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update customer ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update customer" },
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
    console.error(`Failed to delete customer ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
