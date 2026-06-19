"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const DISMISSED_KEY = "pwa-install-dismissed";

// `beforeinstallprompt` is not part of the standard DOM lib types.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari exposes this non-standard flag when launched from the home screen.
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const InstallPrompt = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed or previously dismissed → never show.
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY) === "true") {
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (ios) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 flex justify-center">
      <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md flex items-center gap-4">
        <Image
          src="/icons/icon-192.png"
          alt="Alrifai App"
          width={48}
          height={48}
          className="rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-primary">{t("installPrompt.title")}</h2>
          <p className="text-sm text-secondary">
            {isIOS ? t("installPrompt.iosInstructions") : t("installPrompt.body")}
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {!isIOS && (
            <button
              type="button"
              className="btn dark-btn text-sm"
              onClick={handleInstall}
            >
              {t("installPrompt.install")}
            </button>
          )}
          <button
            type="button"
            className="btn text-sm"
            onClick={handleDismiss}
          >
            {t("installPrompt.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
