"use client";

import { useEffect, useState } from "react";
import { getStoredUserId } from "@/lib/user-session";

export function useRequiredUserId() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedUserId = getStoredUserId();

    if (!storedUserId) {
      setIsChecking(false);
      window.location.href = "/login";
      return;
    }

    setUserId(storedUserId);
    setIsChecking(false);
  }, []);

  return {
    userId,
    isChecking
  };
}
