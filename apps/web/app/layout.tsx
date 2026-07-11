import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/shared/ui/bottom-nav";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-white text-text-primary antialiased">
        {/* Mobile Shell Wrapper */}
        <div className="mx-auto flex h-screen w-full max-w-md flex-col bg-white shadow-2xl relative sm:border-x sm:border-gray-100">
          
          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto pb-24 scroll-smooth scrollbar-hide">
            {children}
          </main>

          {/* Fixed Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 z-50">
            <BottomNav />
          </div>
          
        </div>
      </body>
    </html>
  );
}
