export const defaultAuthenticatedPath = "/dashboard";

export function getSafeRedirectPath(candidate: string | null | undefined) {
  if (!candidate) {
    return defaultAuthenticatedPath;
  }

  const normalizedCandidate = candidate.trim();

  if (!normalizedCandidate.startsWith("/") || normalizedCandidate.startsWith("//")) {
    return defaultAuthenticatedPath;
  }

  if (normalizedCandidate === "/login" || normalizedCandidate === "/signup") {
    return defaultAuthenticatedPath;
  }

  return normalizedCandidate;
}

export function buildNextPath(pathname: string | null, queryString: string) {
  const safePathname = pathname && pathname.startsWith("/") ? pathname : defaultAuthenticatedPath;

  return queryString ? `${safePathname}?${queryString}` : safePathname;
}

export function buildLoginHref(nextPath: string | null | undefined) {
  return `/login?next=${encodeURIComponent(getSafeRedirectPath(nextPath))}`;
}
