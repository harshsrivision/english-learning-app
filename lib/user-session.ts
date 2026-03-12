export const userIdStorageKey = "userId";
const legacyUserIdStorageKey = "bolo-user-id";

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(userIdStorageKey) ?? window.localStorage.getItem(legacyUserIdStorageKey);

  if (!storedValue) {
    return null;
  }

  const parsedValue = Number(storedValue);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export function storeUserId(userId: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(userIdStorageKey, String(userId));
  window.localStorage.removeItem(legacyUserIdStorageKey);
}

export function clearStoredUserId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(userIdStorageKey);
  window.localStorage.removeItem(legacyUserIdStorageKey);
}
