"use client";

import { useEffect } from "react";

// Registers the offline-capable service worker. Production only:
// in dev, Turbopack HMR and a cached SW fight each other.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.error("Service worker registration failed", err);
    });
  }, []);

  return null;
}
