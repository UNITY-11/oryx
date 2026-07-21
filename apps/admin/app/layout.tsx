import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

import "./globals.css";

import { Suspense } from "react";
import { Sidebar } from "@/shared/ui/sidebar";
import { TopHeader } from "@/shared/ui/top-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORYX Admin Panel",
  description: "Manage bookings, services, and customers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-background text-text-primary min-h-screen overflow-x-hidden antialiased"
      >
        {/* Admin App Layout Wrapper */}
        <div className="bg-background relative mx-auto flex h-[100dvh] w-full max-w-[1920px] overflow-hidden shadow-2xl">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Suspense fallback={<div className="h-16" />}>
              <TopHeader />
            </Suspense>
            {/* Main Scrollable Content */}
            <main
              id="admin-main-container"
              className="relative flex h-full w-full flex-1 flex-col overflow-hidden px-4 pt-0 pb-4 md:pr-8 md:pl-4"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
