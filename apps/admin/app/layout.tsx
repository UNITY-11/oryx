import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
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
      <body suppressHydrationWarning className="min-h-screen bg-[#fcf4f0] text-text-primary antialiased overflow-x-hidden">
        {/* Admin App Layout Wrapper */}
        <div className="mx-auto flex h-[100dvh] w-full max-w-[1920px] bg-[#fcf4f0] shadow-2xl relative overflow-hidden">

          <Sidebar />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopHeader />
            {/* Main Scrollable Content */}
            <main id="admin-main-container" className="flex-1 flex flex-col w-full h-full relative overflow-hidden px-4 md:pl-4 md:pr-8 pb-4 pt-0">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
