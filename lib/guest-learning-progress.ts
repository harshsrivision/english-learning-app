export const learnedWordsStorageKey = "bolo-learned-words";
export const guestCompletedChaptersStorageKey = "bolo-guest-completed-chapters";

function readNumberArrayFromStorage(key: string) {
  if (typeof window === "undefined") {
    return [] as number[];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [] as number[];
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return Array.isArray(parsedValue) ? parsedValue.filter((value): value is number => typeof value === "number") : [];
  } catch {
    return [] as number[];
  }
}

function readStringArrayFromStorage(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [] as string[];
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return Array.isArray(parsedValue) ? parsedValue.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [] as string[];
  }
}

export function readLearnedWordIds() {
  return readNumberArrayFromStorage(learnedWordsStorageKey);
}

export function writeLearnedWordIds(wordIds: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(learnedWordsStorageKey, JSON.stringify(wordIds));
}

export function readGuestCompletedChapterIds() {
  return readStringArrayFromStorage(guestCompletedChaptersStorageKey);
}

export function writeGuestCompletedChapterIds(chapterIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(guestCompletedChaptersStorageKey, JSON.stringify(chapterIds));
}
