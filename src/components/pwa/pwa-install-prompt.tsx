"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-auth-ui";
const DISMISS_DURATION_MS = 30 * 60 * 1000;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  return !Number.isNaN(ts) && Date.now() - ts < DISMISS_DURATION_MS;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      promptRef.current = ev;
      setDeferredPrompt(ev);
      if (!wasDismissedRecently()) setTimeout(() => setIsVisible(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      promptRef.current = null;
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = promptRef.current ?? deferredPrompt;
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      promptRef.current = null;
      setIsVisible(false);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Install SSO App</CardTitle>
            <CardDescription>
              Install our app for a better experience and offline access.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-1"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button
            variant="outline"
            className="mr-2"
            onClick={handleDismiss}
          >
            Not now
          </Button>
          <Button onClick={handleInstall} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
