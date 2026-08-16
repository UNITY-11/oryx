"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { PUBLIC_AUTH_PATHS } from "@/features/auth/constants";
import { Sidebar } from "@/shared/ui/sidebar";
import { SidebarProvider } from "@/shared/ui/sidebar-context";
import { TopHeader } from "@/shared/ui/top-header";

function isAuthRoute(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => pathname === path);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-16" />}>
          <TopHeader />
        </Suspense>
        <main
          id="admin-main-container"
          className="relative flex h-full w-full flex-1 flex-col overflow-hidden px-4 pt-0 pb-4 md:pr-8 md:pl-4"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
