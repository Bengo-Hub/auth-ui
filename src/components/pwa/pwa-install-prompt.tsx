"use client";

import { PwaInstallPrompt } from "@bengo-hub/shared-ui-lib/offline";

const DISMISS_KEY = "pwa-install-dismissed-auth-ui";

async function requestPermissions() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if ("storage" in navigator && "persist" in navigator.storage) {
    await navigator.storage.persist();
  }
}

// auth-ui is the umbrella SSO/account app, not tenant-scoped, so there's no
// per-tenant logo to show here — it uses the Codevertex mark itself. Delay/
// dismiss timing matches every other Codevertex app via the shared defaults.
export function PWAInstallPrompt() {
  return (
    <PwaInstallPrompt
      appName="Codevertex Account"
      logoUrl="https://codevertexafrica.com/icon.svg"
      tagline="Install for a faster, full-screen experience with offline access."
      dismissKey={DISMISS_KEY}
      onInstalled={requestPermissions}
    />
  );
}
