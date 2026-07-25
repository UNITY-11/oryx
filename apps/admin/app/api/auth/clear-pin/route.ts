import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  // Delete the pin auth cookie
  cookieStore.delete("admin_pin_auth");
  return NextResponse.json({ success: true });
}
