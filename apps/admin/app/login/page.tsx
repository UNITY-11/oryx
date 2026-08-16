import { Suspense } from "react";

import { LoginForm } from "./login-form";

function LoginLoading() {
  return (
    <div
      className="bg-background flex min-h-[100dvh] min-h-dvh w-full items-center justify-center px-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <p className="text-text-secondary text-sm">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
