"use client";

import { useEffect, useRef, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

export function BackendStatusBanner() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const isHealthyRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: number | null = null;

    async function runHealthCheck() {
      const healthy = await checkBackendHealth();

      if (!isMounted) {
        return;
      }

      isHealthyRef.current = healthy;
      setIsHealthy(healthy);

      if (healthy) {
        setShouldShowBanner(false);

        if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    const showTimerId = window.setTimeout(() => {
      if (!isHealthyRef.current && isMounted) {
        setShouldShowBanner(true);
      }
    }, 3000);

    void runHealthCheck();

    intervalId = window.setInterval(() => {
      if (!isHealthyRef.current) {
        void runHealthCheck();
      }
    }, 10000);

    return () => {
      isMounted = false;
      window.clearTimeout(showTimerId);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  if (isHealthy || !shouldShowBanner) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Backend status banner"
      className="rounded-2xl border border-gold/20 bg-gold/10 p-3 text-sm font-medium text-gold"
    >
      Backend abhi start ho raha hai — 30-60 seconds mein ready ho jayega. Tab tak explore karte raho!
    </div>
  );
}
