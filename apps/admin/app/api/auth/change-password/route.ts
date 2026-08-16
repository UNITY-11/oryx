import { NextResponse } from "next/server";
import {
  getAdminAuthRecord,
  updateAdminPassword,
} from "@/features/auth/admin-store";
import { hashPassword, verifyPassword } from "@/features/auth/password";
import { getSessionFromCookies } from "@/features/auth/session";
import { validateChangePasswordInput } from "@repo/validation";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    const confirmPassword = String(body.confirmPassword ?? newPassword);

    const validationError = validateChangePasswordInput({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const record = await getAdminAuthRecord();
    if (!record?.passwordHash) {
      return NextResponse.json(
        { error: "Admin account is not configured" },
        { status: 500 }
      );
    }

    const currentValid = await verifyPassword(
      currentPassword,
      record.passwordHash
    );
    if (!currentValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await updateAdminPassword(passwordHash);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password failed:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
