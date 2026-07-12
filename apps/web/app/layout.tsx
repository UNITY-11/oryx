import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/shared/ui/bottom-nav";
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
      <body suppressHydrationWarning className="min-h-screen bg-[#fcf4f0] text-text-primary antialiased">
        {/* Mobile Shell Wrapper */}
        <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-[#fcf4f0] shadow-2xl relative sm:border-x sm:border-gray-100">

          {/* Main Scrollable Content */}
          <LenisProvider>
            {children}
          </LenisProvider>

          {/* Bottom Navigation - transparent overlay over content */}
          <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <BottomNav />
            </div>
          </div>

        </div>
      </body>
    </html>
  );
}
