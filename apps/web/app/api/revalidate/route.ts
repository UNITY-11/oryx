import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Revalidate the paths that depend on Sanity data
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/products");
    revalidatePath("/contact");

    // If you have individual service pages, revalidate the dynamic path
    revalidatePath("/service/[id]", "page");

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
