import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";

import { BottomNav } from "@/shared/ui/bottom-nav";
import { LenisProvider } from "@/shared/ui/lenis-provider";
import { TopNav } from "@/shared/ui/top-nav";

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
  title: "ORYX Beauty Spa & Salon",
  description: "Book your appointment at ORYX Beauty Spa & Salon",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ORYX Spa",
  },
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
        {/* App Layout Wrapper */}
        <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-x-hidden shadow-2xl">
          <div className="pointer-events-none absolute top-0 left-0 w-full z-50 md:pointer-events-auto">
            <TopNav />
          </div>

          {/* Bottom Navigation - Mobile Only */}
          <div className="pointer-events-none absolute bottom-0 left-0 z-50 w-full md:hidden">
            <div className="pointer-events-auto">
              <BottomNav />
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden">
            <LenisProvider>{children}</LenisProvider>
          </div>

          {/* Floating Contact Button - Desktop Only */}
          <div className="pointer-events-none absolute right-8 bottom-8 z-50 hidden md:block">
            <div className="pointer-events-auto">
              <Link
                href="/contact"
                className="bg-primary flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
