"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthInput,
  AuthLink,
  AuthShell,
  AuthSubmitButton,
} from "@/features/auth/ui/auth-shell";
import {
  validateResetPasswordFields,
  type ResetPasswordField,
} from "@repo/validation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ResetPasswordField, string>>
  >({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: ResetPasswordField) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = validateResetPasswordFields({
      token,
      password,
      confirmPassword,
    });
    const fieldOnly = {
      password: errors.password,
      confirmPassword: errors.confirmPassword,
    };
    const hasFieldErrors =
      fieldOnly.password || fieldOnly.confirmPassword || errors.token;

    if (hasFieldErrors) {
      if (errors.token) {
        setError(errors.token);
      }
      setFieldErrors({
        password: fieldOnly.password,
        confirmPassword: fieldOnly.confirmPassword,
      });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to reset password");
        return;
      }

      router.replace("/login?reset=1");
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid Reset Link"
        subtitle="This password reset link is missing or incomplete."
      >
        <div className="space-y-4 text-center">
          <p className="text-text-secondary text-sm">
            Request a new reset link from the sign-in page.
          </p>
          <AuthLink href="/forgot-password">Request new link</AuthLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Choose a new password for your admin account."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        noValidate
      >
        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <AuthInput
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
          }}
          placeholder="Repeat new password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600 sm:px-4 sm:py-3">
            {error}
          </p>
        )}

        <AuthSubmitButton loading={loading}>Update Password</AuthSubmitButton>

        <div className="pt-1 text-center sm:pt-0">
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      </form>
    </AuthShell>
  );
}
