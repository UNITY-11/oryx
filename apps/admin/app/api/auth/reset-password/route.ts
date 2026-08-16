import { NextResponse } from "next/server";
import {
  clearPasswordResetToken,
  ensureAdminAuthSeeded,
  getAdminAuthRecord,
  isResetTokenValid,
  updateAdminPassword,
} from "@/features/auth/admin-store";
import { hashPassword } from "@/features/auth/password";
import { validateResetPasswordInput } from "@repo/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? password);

    const validationError = validateResetPasswordInput({
      token,
      password,
      confirmPassword,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await ensureAdminAuthSeeded();
    const record = await getAdminAuthRecord();
    if (!record || !isResetTokenValid(record, token)) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await updateAdminPassword(passwordHash);
    await clearPasswordResetToken();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
