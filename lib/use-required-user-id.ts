"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildLoginHref, readCurrentPathFromLocation } from "@/lib/auth-navigation";
import { useUserSession } from "@/lib/use-user-session";

export function useRequiredUserId() {
  const { userId, isChecking } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && !userId) {
      router.replace(buildLoginHref(readCurrentPathFromLocation()));
    }
  }, [isChecking, router, userId]);

  return {
    userId,
    isChecking
  };
}
