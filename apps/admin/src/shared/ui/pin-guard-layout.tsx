"use client";

import { useEffect, useState } from "react";
import { PinLockModal } from "@/shared/ui/pin-lock-modal";

export function PinGuardLayout({
  children,
  description,
}: {
  children: React.ReactNode;
  description: string;
}) {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    fetch("/api/auth/clear-pin", { method: "POST" }).catch(() => {});

    return () => {
      fetch("/api/auth/clear-pin", { method: "POST" }).catch(() => {});
    };
  }, []);

  return (
    <>
      <div
        className={
          !isAuth
            ? "pointer-events-none relative h-full w-full blur-sm filter transition-all duration-300"
            : "relative h-full w-full"
        }
      >
        {children}
      </div>
      {!isAuth && (
        <PinLockModal
          description={description}
          onSuccess={() => setIsAuth(true)}
        />
      )}
    </>
  );
}
