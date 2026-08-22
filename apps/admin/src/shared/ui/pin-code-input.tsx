"use client";

import { useEffect, useState } from "react";
import { ADMIN_PIN_LENGTH } from "@/features/pin/constants";
import { Loader2 } from "lucide-react";

type PinCodeInputProps = {
  length?: number;
  disabled?: boolean;
  error?: boolean;
  onComplete: (pin: string) => void;
  onChange?: () => void;
};

export function PinCodeInput({
  length = ADMIN_PIN_LENGTH,
  disabled,
  error,
  onComplete,
  onChange,
}: PinCodeInputProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (error) setPin("");
  }, [error]);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, length);
    setPin(digits);
    onChange?.();
    if (digits.length === length) {
      onComplete(digits);
    }
  };

  return (
    <div className="relative flex w-full justify-center gap-2 sm:gap-3">
      <input
        type="tel"
        autoFocus
        maxLength={length}
        value={pin}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        aria-label="PIN code"
      />
      {Array.from({ length }, (_, index) => {
        const isActive = pin.length === index;
        const isFilled = pin.length > index;
        return (
          <div
            key={index}
            className={`flex h-14 w-11 items-center justify-center rounded-2xl text-3xl font-bold transition-all duration-200 sm:h-16 sm:w-14 sm:text-4xl ${
              error
                ? "border-2 border-red-500 bg-red-50 text-red-500 shadow-sm"
                : isActive
                  ? "border-primary scale-105 border-2 bg-white shadow-md"
                  : isFilled
                    ? "border-primary/50 bg-primary/5 border-2 text-gray-800"
                    : "border-2 border-gray-100 bg-gray-50/50"
            }`}
          >
            {isFilled ? "•" : ""}
          </div>
        );
      })}
    </div>
  );
}

export function PinCodeStatus({
  loading,
  error,
}: {
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <div className="mt-4 flex h-8 w-full items-center justify-center">
      {loading && (
        <div className="text-primary flex items-center text-sm font-medium">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating…
        </div>
      )}
      {error && !loading && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-2 text-center text-sm font-medium text-red-500">
          Incorrect PIN. Please try again.
        </div>
      )}
    </div>
  );
}
