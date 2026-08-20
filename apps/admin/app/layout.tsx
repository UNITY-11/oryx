import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

import "./globals.css";

import { AdminShell } from "@/shared/ui/admin-shell";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/favicon.png",
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f3e6dc",
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
        <div className="bg-background relative mx-auto flex h-[100dvh] w-full max-w-[1920px] overflow-hidden shadow-2xl">
          <AdminShell>{children}</AdminShell>
        </div>
      </body>
    </html>
  );
}
