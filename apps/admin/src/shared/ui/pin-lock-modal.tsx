"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PIN_LENGTH } from "@/features/pin/constants";
import { PinCodeInput, PinCodeStatus } from "@/shared/ui/pin-code-input";
import { Lock } from "lucide-react";

type PinLockModalProps = {
  description?: string;
  onSuccess?: () => void;
};

export function PinLockModal({
  description = "Enter the 6-digit admin PIN to access this section.",
  onSuccess,
}: PinLockModalProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const verifyPin = async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: currentPin, setSession: !onSuccess }),
      });

      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4 backdrop-blur-md">
      <div
        className={`relative flex w-full max-w-md flex-col items-center rounded-[2rem] border border-gray-100 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 sm:p-10 ${error ? "scale-105 shadow-red-500/10" : ""}`}
      >
        <div className="relative mb-6">
          <div className="bg-primary/20 absolute inset-0 rounded-full blur-xl" />
          <div className="border-primary/20 from-primary/5 to-primary/10 text-primary relative flex h-20 w-20 items-center justify-center rounded-full border bg-gradient-to-br shadow-inner">
            <Lock className="h-9 w-9" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Section Locked
        </h2>
        <p className="mb-8 px-4 text-center text-sm leading-relaxed text-gray-500">
          {description}
        </p>

        <div className="flex w-full flex-col items-center gap-4">
          <PinCodeInput
            length={ADMIN_PIN_LENGTH}
            disabled={loading}
            error={error}
            onChange={() => setError(false)}
            onComplete={verifyPin}
          />
          <PinCodeStatus loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
