"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginHref, buildNextPath } from "@/lib/auth-navigation";
import { useUserSession } from "@/lib/use-user-session";

export function useRequiredUserId() {
  const { userId, isChecking } = useUserSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  useEffect(() => {
    if (!isChecking && !userId) {
      router.replace(buildLoginHref(buildNextPath(pathname, queryString)));
    }
  }, [isChecking, pathname, queryString, router, userId]);

  return {
    userId,
    isChecking
  };
}
