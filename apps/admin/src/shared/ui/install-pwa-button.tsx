"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Explicitly register the service worker to ensure it's active
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
    }

    // Clear stale install flag from previous versions
    localStorage.removeItem("pwa_installed");

    // Check if app is running in standalone mode (PWA)
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        ("standalone" in navigator && (navigator as any).standalone)
      );
    };

    setIsStandalone(checkStandalone());

    // Listen to media query changes to detect entering standalone mode dynamically
    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const handleMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };
    mqStandalone.addEventListener("change", handleMqChange);

    // Listen to beforeinstallprompt event
    // This is the ONLY reliable way to know if the app is installable.
    // If the browser fires this, the app is NOT installed yet.
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mqStandalone.removeEventListener("change", handleMqChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Hide the button if running inside the PWA
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  // Only show the install button when the browser has confirmed the app is installable
  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="mt-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </button>
  );
}

