"use client";

import { useEffect, useState } from "react";
import { userSessionChangedEvent } from "@/lib/browser-events";
import { getStoredUserId } from "@/lib/user-session";

export function useUserSession() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    function syncSession() {
      setUserId(getStoredUserId());
      setIsChecking(false);
    }

    syncSession();
    window.addEventListener(userSessionChangedEvent, syncSession as EventListener);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(userSessionChangedEvent, syncSession as EventListener);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  return {
    userId,
    hasSession: userId !== null,
    isChecking
  };
}
