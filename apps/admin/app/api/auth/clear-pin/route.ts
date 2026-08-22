import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_PIN_COOKIE } from "@/features/pin/constants";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_PIN_COOKIE, path: "/" });
  return NextResponse.json({ success: true });
}
