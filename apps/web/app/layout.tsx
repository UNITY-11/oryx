import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

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
        <div className="bg-background relative mx-auto flex h-[100dvh] w-full max-w-[1920px] flex-col overflow-x-hidden shadow-2xl">
          <div className="pointer-events-none absolute top-4 right-4 left-4 z-50 md:pointer-events-auto">
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
        </div>
      </body>
    </html>
  );
}
