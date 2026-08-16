"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthInput,
  AuthLink,
  AuthShell,
  AuthSubmitButton,
} from "@/features/auth/ui/auth-shell";
import { validateLoginFields, type LoginField } from "@repo/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const resetSuccess = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<LoginField, string>>
  >({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: LoginField) => {
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

    const errors = validateLoginFields({ email, password });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.replace(from.startsWith("/login") ? "/" : from);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Sign In"
      subtitle="Sign in with your authorized admin email to manage bookings and spa operations."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        noValidate
      >
        {resetSuccess && (
          <p className="rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-sm text-green-700 sm:px-4 sm:py-3">
            Password updated. You can sign in with your new password.
          </p>
        )}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
          placeholder="admin@example.com"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600 sm:px-4 sm:py-3">
            {error}
          </p>
        )}

        <AuthSubmitButton loading={loading}>Sign In</AuthSubmitButton>

        <div className="pt-1 text-center sm:pt-0">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>
      </form>
    </AuthShell>
  );
}
