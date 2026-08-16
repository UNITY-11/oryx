import { NextResponse } from "next/server";
import { ensureAdminAuthSeeded } from "@/features/auth/admin-store";
import { ADMIN_EMAIL } from "@/features/auth/constants";
import { verifyPassword } from "@/features/auth/password";
import { createSessionToken, setSessionCookie } from "@/features/auth/session";
import { normalizeEmail, validateLoginInput } from "@repo/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");

    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const record = await ensureAdminAuthSeeded();
    const valid = await verifyPassword(password, record.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(ADMIN_EMAIL);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, email: ADMIN_EMAIL });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
