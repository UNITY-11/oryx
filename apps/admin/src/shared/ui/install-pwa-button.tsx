"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Explicitly register the service worker to ensure it's active
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
    }

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

    // Also listen to media query changes to detect entering standalone mode dynamically
    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const handleMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };
    mqStandalone.addEventListener("change", handleMqChange);

    // Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    // Check if we already marked it as installed
    if (localStorage.getItem("pwa_installed") === "true") {
      setIsInstalled(true);
    }

    // Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      localStorage.setItem("pwa_installed", "true");
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

  if (isStandalone || isInstalled) {
    // Do not show button if already running as PWA or installed
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
        localStorage.setItem("pwa_installed", "true");
      }
    }
  };

  return (
    <button
      onClick={() => {
        if (deferredPrompt) {
          handleInstallClick();
        } else {
          alert(
            "The app is still loading PWA features or your browser doesn't support installation from this page. Try refreshing."
          );
        }
      }}
      className={`mt-2 flex w-full items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
        deferredPrompt
          ? "bg-primary hover:bg-primary/90 text-white"
          : "bg-primary/50 cursor-not-allowed text-white/80"
      }`}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </button>
  );
}
