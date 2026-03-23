"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildLoginHref, readCurrentPathFromLocation } from "@/lib/auth-navigation";
import { useUserSession } from "@/lib/use-user-session";

type UseRequiredUserIdOptions = {
  redirectIfMissing?: boolean;
};

export function useRequiredUserId(options: UseRequiredUserIdOptions = {}) {
  const { userId, isChecking } = useUserSession();
  const router = useRouter();
  const { redirectIfMissing = true } = options;

  useEffect(() => {
    if (redirectIfMissing && !isChecking && !userId) {
      router.replace(buildLoginHref(readCurrentPathFromLocation()));
    }
  }, [isChecking, redirectIfMissing, router, userId]);

  return {
    userId,
    isChecking
  };
}
