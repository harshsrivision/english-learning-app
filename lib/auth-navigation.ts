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

export function buildLoginHref(nextPath: string | null | undefined) {
  return `/login?next=${encodeURIComponent(getSafeRedirectPath(nextPath))}`;
}

export function buildSignupHref(nextPath: string | null | undefined) {
  return `/signup?next=${encodeURIComponent(getSafeRedirectPath(nextPath))}`;
}

export function readRedirectPathFromLocation() {
  if (typeof window === "undefined") {
    return defaultAuthenticatedPath;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return getSafeRedirectPath(searchParams.get("next"));
}

export function readCurrentPathFromLocation() {
  if (typeof window === "undefined") {
    return defaultAuthenticatedPath;
  }

  return getSafeRedirectPath(`${window.location.pathname}${window.location.search}`);
}
