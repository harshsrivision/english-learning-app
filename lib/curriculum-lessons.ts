import { getStoredUserId } from "./user-session";
import type { CurriculumChapterSummary, CurriculumLesson, CurriculumLevelSummary } from "./curriculum";

export type CurriculumChapterKind = "Foundation" | "Daily Life" | "Speaking" | "Professional" | "Revision";

export type CurriculumChapterCard = {
  route_id: string;
  chapter_id: string;
  level: number;
  level_title: string;
  cefr_band: string;
  title: string;
  summary: string;
  order_index: number;
  lesson_count: number;
  kind: CurriculumChapterKind;
  lesson_titles: CurriculumChapterSummary["lesson_titles"];
};

export type CurriculumProgress = {
  completedChapterIds: string[];
};

const curriculumProgressStoragePrefix = "bolo-curriculum-progress-v1";

function normalizeCompletedChapterIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)));
}

export function createDefaultCurriculumProgress(): CurriculumProgress {
  return {
    completedChapterIds: []
  };
}

export function buildCurriculumLevelRoute(levelId: number) {
  return `/lessons/${levelId}`;
}

export function getCurriculumChapterRouteId(levelId: number, chapterOrder: number) {
  return `${levelId}-${chapterOrder}`;
}

export function buildCurriculumChapterRoute(levelId: number, chapterRouteId: string) {
  return `/lessons/${levelId}/${chapterRouteId}`;
}

export function parseCurriculumChapterRouteId(value: string) {
  const match = value.trim().match(/^(\d+)-(\d+)$/);

  if (!match) {
    return null;
  }

  const levelId = Number(match[1]);
  const chapterOrder = Number(match[2]);

  if (!Number.isInteger(levelId) || levelId <= 0 || !Number.isInteger(chapterOrder) || chapterOrder <= 0) {
    return null;
  }

  return {
    levelId,
    chapterOrder
  };
}

export function toCurriculumChapterApiId(value: string) {
  if (/^L\d+-C\d+$/i.test(value.trim())) {
    return value.trim().toUpperCase();
  }

  const parsed = parseCurriculumChapterRouteId(value);

  if (!parsed) {
    return value.trim();
  }

  return `L${parsed.levelId}-C${parsed.chapterOrder}`;
}

function getCurriculumProgressStorageKey(userId: number | null = getStoredUserId()) {
  return userId ? `${curriculumProgressStoragePrefix}:user:${userId}` : `${curriculumProgressStoragePrefix}:guest`;
}

export function readCurriculumProgress(userId: number | null = getStoredUserId()) {
  if (typeof window === "undefined") {
    return createDefaultCurriculumProgress();
  }

  const storedValue = window.localStorage.getItem(getCurriculumProgressStorageKey(userId));

  if (!storedValue) {
    return createDefaultCurriculumProgress();
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<CurriculumProgress>;

    return {
      completedChapterIds: normalizeCompletedChapterIds(parsedValue.completedChapterIds)
    };
  } catch {
    return createDefaultCurriculumProgress();
  }
}

export function writeCurriculumProgress(progress: CurriculumProgress, userId: number | null = getStoredUserId()) {
  if (typeof window === "undefined") {
    return;
  }

  const nextValue: CurriculumProgress = {
    completedChapterIds: normalizeCompletedChapterIds(progress.completedChapterIds)
  };

  window.localStorage.setItem(getCurriculumProgressStorageKey(userId), JSON.stringify(nextValue));
}

export function markCurriculumChapterCompleted(progress: CurriculumProgress, chapterRouteId: string) {
  return {
    completedChapterIds: normalizeCompletedChapterIds([...progress.completedChapterIds, chapterRouteId])
  } satisfies CurriculumProgress;
}

export function getCurriculumCompletedSet(progress: CurriculumProgress) {
  return new Set(progress.completedChapterIds);
}

export function getCurriculumChapterRouteIds(level: CurriculumLevelSummary) {
  return level.chapters.map((chapter) => getCurriculumChapterRouteId(level.level, chapter.order_index));
}

export function getCurriculumUnlockedLevelIds(levels: CurriculumLevelSummary[], completedSet: Set<string>, hasSession: boolean) {
  const sortedLevels = [...levels].sort((left, right) => left.level - right.level);
  const unlockedLevelIds = new Set<number>();

  for (const [index, level] of sortedLevels.entries()) {
    if (index === 0) {
      unlockedLevelIds.add(level.level);
      continue;
    }

    if (!hasSession) {
      continue;
    }

    const previousLevel = sortedLevels[index - 1];
    const previousLevelRouteIds = getCurriculumChapterRouteIds(previousLevel);

    if (previousLevelRouteIds.every((routeId) => completedSet.has(routeId))) {
      unlockedLevelIds.add(level.level);
    }
  }

  return unlockedLevelIds;
}

export function getCurriculumLevelProgress(level: CurriculumLevelSummary, completedSet: Set<string>) {
  const chapterRouteIds = getCurriculumChapterRouteIds(level);
  const completedCount = chapterRouteIds.filter((routeId) => completedSet.has(routeId)).length;
  const totalChapters = chapterRouteIds.length;

  return {
    completedCount,
    totalChapters,
    progressPercent: totalChapters ? Math.round((completedCount / totalChapters) * 100) : 0
  };
}

export function deriveCurriculumChapterKind(title: string, summary: string): CurriculumChapterKind {
  const combined = `${title} ${summary}`.toLowerCase();

  if (/sound|first|survival|basic|introduction/.test(combined)) {
    return "Foundation";
  }

  if (/home|family|daily|travel|shop|community|routine|life/.test(combined)) {
    return "Daily Life";
  }

  if (/speak|conversation|discussion|talk|presentation|interview|role-play/.test(combined)) {
    return "Speaking";
  }

  if (/work|office|professional|client|business|leadership|meeting/.test(combined)) {
    return "Professional";
  }

  return "Revision";
}

export function getCurriculumChapterKindClasses(kind: CurriculumChapterKind) {
  switch (kind) {
    case "Foundation":
      return "rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest";
    case "Daily Life":
      return "rounded-full bg-sky px-3 py-1 text-xs font-semibold text-blue-700";
    case "Speaking":
      return "rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold";
    case "Professional":
      return "rounded-full bg-clay/10 px-3 py-1 text-xs font-semibold text-clay";
    case "Revision":
      return "rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink";
  }
}

export function getCurriculumBandBadgeClasses(cefrBand: string) {
  if (/A0|A1/.test(cefrBand)) {
    return "rounded-full bg-forest-soft px-3 py-1 text-xs font-bold text-forest";
  }

  if (/A2/.test(cefrBand)) {
    return "rounded-full bg-sky px-3 py-1 text-xs font-bold text-blue-700";
  }

  if (/B1/.test(cefrBand)) {
    return "rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold";
  }

  return "rounded-full bg-clay/10 px-3 py-1 text-xs font-bold text-clay";
}

export function getCurriculumLevelDurationLabel(lessonCount: number) {
  const hours = Math.max(1, Math.round((lessonCount * 15) / 60));
  return `${hours} hr path`;
}

export function getCurriculumChapterCards(level: CurriculumLevelSummary): CurriculumChapterCard[] {
  return level.chapters.map((chapter) => ({
    route_id: getCurriculumChapterRouteId(level.level, chapter.order_index),
    chapter_id: chapter.chapter_id,
    level: level.level,
    level_title: level.title,
    cefr_band: level.cefr_band,
    title: chapter.title,
    summary: chapter.summary,
    order_index: chapter.order_index,
    lesson_count: chapter.lesson_titles.length,
    kind: deriveCurriculumChapterKind(chapter.title, chapter.summary),
    lesson_titles: chapter.lesson_titles
  }));
}

export function isCurriculumChapterUnlocked(chapters: CurriculumChapterCard[], chapterRouteId: string, completedSet: Set<string>) {
  const chapterIndex = chapters.findIndex((chapter) => chapter.route_id === chapterRouteId);

  if (chapterIndex <= 0) {
    return true;
  }

  return completedSet.has(chapters[chapterIndex - 1]?.route_id ?? "");
}

export function findCurriculumLevel(levels: CurriculumLevelSummary[], levelId: number) {
  return levels.find((level) => level.level === levelId) ?? null;
}

export function findCurriculumChapter(level: CurriculumLevelSummary | null, chapterRouteId: string) {
  if (!level) {
    return null;
  }

  return getCurriculumChapterCards(level).find((chapter) => chapter.route_id === chapterRouteId || chapter.chapter_id === toCurriculumChapterApiId(chapterRouteId)) ?? null;
}

export function buildCurriculumExamples(lesson: CurriculumLesson) {
  const examples = lesson.content.real_life_conversation_examples
    .flatMap((conversation) =>
      conversation.dialogue.slice(0, 2).map((turn) => ({
        english: `${turn.speaker}: ${turn.line}`,
        hindi: lesson.content.explanation.hindi_support
      }))
    )
    .slice(0, 4);

  if (examples.length) {
    return examples;
  }

  return lesson.content.sentence_patterns.slice(0, 4).map((pattern) => ({
    english: pattern,
    hindi: lesson.content.explanation.hindi_support
  }));
}