"use client";

import { useState } from "react";
import { AuthInput, AuthSubmitButton } from "@/features/auth/ui/auth-shell";
import {
  validateChangePasswordFields,
  type ChangePasswordField,
} from "@repo/validation";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ChangePasswordField, string>>
  >({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: ChangePasswordField) => {
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
    setSuccess("");

    const errors = validateChangePasswordFields({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to change password");
        return;
      }

      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col py-2">
      <div className="border-primary/10 rounded-[28px] border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-primary-dark font-serif text-2xl font-medium">
          Account Security
        </h1>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">
          Update your admin password. Use at least 8 characters.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 sm:space-y-5"
          noValidate
        >
          <AuthInput
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value);
              clearFieldError("currentPassword");
            }}
            autoComplete="current-password"
            error={fieldErrors.currentPassword}
          />
          <AuthInput
            label="New password"
            type="password"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              clearFieldError("newPassword");
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={fieldErrors.newPassword}
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

          {success && (
            <p className="rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-sm text-green-700 sm:px-4 sm:py-3">
              {success}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600 sm:px-4 sm:py-3">
              {error}
            </p>
          )}

          <AuthSubmitButton loading={loading}>Update Password</AuthSubmitButton>
        </form>
      </div>
    </div>
  );
}
