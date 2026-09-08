import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    // Purge all public pages that depend on Sanity CMS content
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/products");
    revalidatePath("/contact");
    revalidatePath("/service/[id]", "page");
    revalidatePath("/booking");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Successfully revalidated routes",
    });
  } catch (err) {
    console.error("Error during revalidation:", err);
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
