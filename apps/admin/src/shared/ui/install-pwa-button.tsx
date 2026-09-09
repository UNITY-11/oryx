"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
    }

    localStorage.removeItem("pwa_installed");

    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        ("standalone" in navigator && (navigator as any).standalone)
      );
    };

    setIsStandalone(checkStandalone());

    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const handleMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };
    mqStandalone.addEventListener("change", handleMqChange);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setHint(null);
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

  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    setHint(null);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }

    if (isIosDevice()) {
      setHint("Tap Share, then Add to Home Screen.");
      return;
    }

    setHint("Use your browser menu → Install app / Add to Home screen.");
  };

  return (
    <div className="mt-2 w-full">
      <button
        type="button"
        onClick={handleInstallClick}
        className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Install App</span>
      </button>
      {hint && (
        <p className="text-text-secondary mt-1.5 px-1 text-center text-[11px] leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}
