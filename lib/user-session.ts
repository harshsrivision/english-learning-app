import { dispatchUserSessionChanged } from "@/lib/browser-events";

export const userIdStorageKey = "userId";
export const legacyUserIdStorageKey = "bolo-user-id";

function parseStoredUserId(storedValue: string | null) {
  if (!storedValue) {
    return null;
  }

  const parsedValue = Number(storedValue);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredUserId(window.localStorage.getItem(userIdStorageKey) ?? window.localStorage.getItem(legacyUserIdStorageKey));
}

export function storeUserId(userId: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(userIdStorageKey, String(userId));
  window.localStorage.removeItem(legacyUserIdStorageKey);
  dispatchUserSessionChanged(userId);
}

export function clearStoredUserId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(userIdStorageKey);
  window.localStorage.removeItem(legacyUserIdStorageKey);
  dispatchUserSessionChanged(null);
}
