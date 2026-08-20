import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

import "./globals.css";

import { AppShell } from "@/shared/providers/app-shell";

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

  icons: {
    icon: "/images/favicon.png",
  },

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
