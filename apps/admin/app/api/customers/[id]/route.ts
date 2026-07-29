import { NextResponse } from "next/server";
import { CUSTOMER_BY_ID_QUERY } from "@/features/customers/sanity-queries";
import { syncCustomerNameEverywhere } from "@/features/customers/sync-customer-name";
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
    const { id: _ignore, phone: _phoneIgnored, ...rawFields } = body;

    const allowed = [
      "name",
      "email",
      "avatar",
      "tier",
      "totalSpent",
      "lastVisit",
      "status",
      "age",
    ] as const;
    const fields: Record<string, unknown> = {};
    for (const key of allowed) {
      if (rawFields[key] !== undefined) fields[key] = rawFields[key];
    }

    const existing = await sanityClient.fetch<{
      name?: string;
      phone?: string;
    } | null>(`*[_type == "customer" && _id == $id][0]{ name, phone }`, {
      id,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const nextName =
      typeof fields.name === "string" ? fields.name.trim() : undefined;
    if (nextName !== undefined) fields.name = nextName;

    const nameChanged =
      nextName !== undefined &&
      nextName.length > 0 &&
      nextName !== existing.name;

    // 1) Save customer first so the profile always updates
    await sanityClient.patch(id).set(fields).commit();

    // 2) Sync denormalized names (bookings + notifications). Never fail the
    //    whole request if sync has issues — customer is already saved.
    if (nameChanged && nextName) {
      try {
        const syncResult = await syncCustomerNameEverywhere({
          customerId: id,
          oldName: existing.name || "",
          newName: nextName,
          phone: existing.phone,
        });
        console.log(`Customer ${id} name sync:`, syncResult);
      } catch (syncError) {
        console.error(
          `Customer ${id} saved; retrying name sync once:`,
          syncError
        );
        try {
          const syncResult = await syncCustomerNameEverywhere({
            customerId: id,
            oldName: existing.name || "",
            newName: nextName,
            phone: existing.phone,
          });
          console.log(`Customer ${id} name sync (retry):`, syncResult);
        } catch (retryError) {
          console.error(
            `Customer ${id} saved but name sync failed after retry:`,
            retryError
          );
        }
      }
    }

    const updated = await sanityClient.fetch(CUSTOMER_BY_ID_QUERY, { id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update customer ${id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update customer",
      },
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
