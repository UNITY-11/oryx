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

  manifest: "/manifest.json",

  icons: {
    icon: "/images/favicon.png",
    apple: "/icon-192x192.png",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
