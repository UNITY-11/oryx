"use client";

import { BottomNav } from "@/shared/ui/bottom-nav";
import { LenisProvider } from "@/shared/ui/lenis-provider";
import { TopNav } from "@/shared/ui/top-nav";

import { SearchProvider } from "./search-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-x-hidden shadow-2xl">
        <div className="pointer-events-none absolute top-0 left-0 z-50 w-full md:pointer-events-auto">
          <TopNav />
        </div>

        <div className="md:hidden">
          <BottomNav />
        </div>

        <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden">
          <LenisProvider>{children}</LenisProvider>
        </div>
      </div>
    </SearchProvider>
  );
}
