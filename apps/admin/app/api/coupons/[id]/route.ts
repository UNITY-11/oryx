import { NextResponse } from "next/server";
import { GET_COUPON_BY_ID_QUERY } from "@/features/coupons/sanity-queries";
import { revalidateWebSite } from "@/shared/lib/revalidate-web";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await sanityClient.fetch(GET_COUPON_BY_ID_QUERY, {
      id,
    });
    if (!item) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to fetch coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await sanityClient.patch(id).set(body).commit();
    await revalidateWebSite();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sanityClient.delete(id);
    await revalidateWebSite();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
