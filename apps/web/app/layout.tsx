import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/shared/ui/bottom-nav";
import { TopNav } from "@/shared/ui/top-nav";
import { LenisProvider } from "@/shared/ui/lenis-provider";

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
      <body suppressHydrationWarning className="min-h-screen bg-[#fcf4f0] text-text-primary antialiased overflow-x-hidden">
        {/* App Layout Wrapper */}
        <div className="mx-auto flex h-[100dvh] w-full max-w-[1920px] flex-col bg-[#fcf4f0] shadow-2xl relative overflow-x-hidden">

          <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none md:pointer-events-auto">
            <TopNav />
          </div>

          {/* Bottom Navigation - Mobile Only */}
          <div className="md:hidden absolute bottom-0 left-0 w-full z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <BottomNav />
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 h-[100dvh] relative overflow-hidden flex flex-col">
            <LenisProvider>
              {children}
            </LenisProvider>
          </div>

        </div>
      </body>
    </html>
  );
}
