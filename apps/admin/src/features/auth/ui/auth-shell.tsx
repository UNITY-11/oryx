"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-[100dvh] min-h-dvh w-full flex-col lg:flex-row lg:overflow-hidden">
      {/* Brand panel — full width on mobile (compact), split on large screens */}
      <div className="border-primary/10 relative shrink-0 border-b bg-[#fcf4f0] px-5 py-8 sm:px-8 sm:py-10 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:border-r lg:border-b-0 lg:px-10 lg:py-12 xl:w-[42%] xl:px-14 xl:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/8 absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute bottom-0 left-0 h-40 w-40 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <Image
            src="/images/oryx-logo.png"
            alt="ORYX Spa"
            width={160}
            height={64}
            className="h-10 w-auto object-contain sm:h-12 lg:h-14 xl:h-16"
            priority
          />
          <p className="text-primary mt-4 text-[10px] font-semibold tracking-[0.22em] uppercase sm:text-xs">
            Admin Portal
          </p>
        </div>

        <div className="relative z-10 mt-6 hidden text-center sm:block lg:mt-0 lg:text-left">
          <h2 className="text-primary-dark font-serif text-xl font-medium sm:text-2xl lg:text-3xl xl:text-4xl">
            Oryx Spa
          </h2>
          <p className="text-text-secondary mt-2 max-w-md text-sm leading-relaxed sm:text-base lg:max-w-sm">
            Manage bookings, services, and guest experiences from one secure
            place.
          </p>
        </div>

        <p className="text-text-secondary relative z-10 mt-6 hidden text-xs lg:block">
          Authorized access only
        </p>
      </div>

      {/* Form panel */}
      <div
        className="scrollbar-hide flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 xl:px-16"
        style={{
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
          paddingTop: "max(2rem, env(safe-area-inset-top))",
        }}
      >
        <div className="mx-auto w-full max-w-md lg:max-w-lg">
          <div className="mb-6 text-center lg:mb-8 lg:text-left">
            <h1 className="text-primary-dark font-serif text-2xl font-medium sm:text-3xl lg:text-[2rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-text-secondary mt-2 text-sm leading-relaxed sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          <div className="border-primary/10 rounded-[24px] border bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-7 lg:p-8">
            {children}
          </div>

          <p className="text-text-secondary mt-6 text-center text-xs sm:mt-8 lg:hidden">
            ORYX Spa Admin · Authorized access only
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
}

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label className="text-primary-dark mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`border-primary/15 focus:border-primary text-primary-dark w-full rounded-2xl border bg-[#fcf4f0]/60 px-4 py-3 text-base transition-colors outline-none focus:bg-white sm:text-sm ${isPassword ? "pr-12" : ""} ${error ? "border-red-400" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-text-secondary hover:text-primary-dark absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
      </div>
      <AuthFieldError message={error} />
    </div>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="bg-primary mt-2 flex min-h-[48px] w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px]"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-primary hover:text-primary-dark inline-block py-1 text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
