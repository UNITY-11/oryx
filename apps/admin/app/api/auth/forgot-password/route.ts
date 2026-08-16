import { NextResponse } from "next/server";
import {
  ensureAdminAuthSeeded,
  setPasswordResetToken,
} from "@/features/auth/admin-store";
import { ADMIN_EMAIL } from "@/features/auth/constants";
import { sendPasswordResetEmail } from "@/features/auth/email";
import { generateResetToken } from "@/features/auth/password";
import { normalizeEmail, validateForgotPasswordInput } from "@repo/validation";

function getResetUrl(token: string, request: Request) {
  const origin =
    process.env.NEXT_PUBLIC_ADMIN_URL || new URL(request.url).origin;
  return `${origin.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    const validationError = validateForgotPasswordInput({ email });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Always return the same message to avoid leaking whether the account exists.
    const genericMessage =
      "If this email is registered, a reset link has been sent.";

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ message: genericMessage });
    }

    await ensureAdminAuthSeeded();
    const token = generateResetToken();
    await setPasswordResetToken(token);

    const resetUrl = getResetUrl(token, request);
    await sendPasswordResetEmail(resetUrl);

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send reset email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
