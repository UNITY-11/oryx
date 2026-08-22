import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_PIN_COOKIE,
  ADMIN_PIN_LENGTH,
  getConfiguredAdminPin,
  isValidAdminPinFormat,
} from "@/features/pin/constants";

export async function POST(request: Request) {
  try {
    const configuredPin = getConfiguredAdminPin();
    if (!configuredPin) {
      return NextResponse.json(
        {
          success: false,
          error: `ADMIN_PIN must be a ${ADMIN_PIN_LENGTH}-digit code in environment`,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const pin = String(body.pin ?? "").trim();
    const setSession = Boolean(body.setSession);

    if (!isValidAdminPinFormat(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: `PIN must be ${ADMIN_PIN_LENGTH} digits`,
        },
        { status: 400 }
      );
    }

    if (pin !== configuredPin) {
      return NextResponse.json(
        { success: false, error: "Incorrect PIN" },
        { status: 401 }
      );
    }

    if (setSession) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_PIN_COOKIE, "true", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
