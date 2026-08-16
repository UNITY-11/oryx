"use client";

import { useState } from "react";
import {
  AuthInput,
  AuthLink,
  AuthShell,
  AuthSubmitButton,
} from "@/features/auth/ui/auth-shell";
import { validateForgotPasswordFields } from "@repo/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"email", string>>
  >({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const errors = validateForgotPasswordFields({ email });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to send reset email");
        return;
      }

      setMessage(
        data.message ??
          "If this email is registered, a reset link has been sent."
      );
    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your admin email and we will send a secure reset link."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        noValidate
      >
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (fieldErrors.email) {
              setFieldErrors({});
            }
          }}
          placeholder="admin@example.com"
          autoComplete="email"
          error={fieldErrors.email}
        />

        {message && (
          <p className="rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-sm text-green-700 sm:px-4 sm:py-3">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600 sm:px-4 sm:py-3">
            {error}
          </p>
        )}

        <AuthSubmitButton loading={loading}>Send Reset Link</AuthSubmitButton>

        <div className="pt-1 text-center sm:pt-0">
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      </form>
    </AuthShell>
  );
}
