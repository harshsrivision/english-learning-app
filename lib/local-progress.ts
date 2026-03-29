import { dailyPlanBlocks, roadmapLevels, weeklyChallenges, type CefrLevel, type DailyPlanBlock, type WeeklyChallenge } from "@/lib/app-data";
import { dispatchLearnerProgressChanged } from "@/lib/browser-events";
import { getStoredUserId } from "@/lib/user-session";

export type WeeklyStats = {
  vocabularyWords: number;
  speakingDrills: number;
  perfectGrammarDays: number;
  roleplays: number;
  articlesRead: number;
  writingPieces: number;
};

export type LearnerProgress = {
  totalXp: number;
  streakDays: number;
  badges: string[];
  lessonsCompleted: number;
  speakingMinutes: number;
  vocabularyWords: number;
  lastActiveDate: string | null;
  completedPlanByDate: Record<string, string[]>;
  weeklyStats: WeeklyStats;
  weekKey: string;
};

export type LearnerProgressDelta = {
  xp?: number;
  lessonsCompleted?: number;
  speakingMinutes?: number;
  vocabularyWords?: number;
  badges?: string[];
  streakActivity?: boolean;
  weeklyStats?: Partial<WeeklyStats>;
};

export const progressStoragePrefix = "bolo-english-progress-v3";
const legacyProgressStorageKey = "bolo-english-progress-v2";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function addDays(date: Date, value: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + value);
  return nextDate;
}

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getWeekStart(date = new Date()) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
}

export function getWeekKey(date = new Date()) {
  return getDateKey(getWeekStart(date));
}

function createDefaultWeeklyStats(): WeeklyStats {
  return {
    vocabularyWords: 0,
    speakingDrills: 0,
    perfectGrammarDays: 0,
    roleplays: 0,
    articlesRead: 0,
    writingPieces: 0
  };
}

export function createDefaultLearnerProgress(): LearnerProgress {
  return {
    totalXp: 0,
    streakDays: 0,
    badges: [],
    lessonsCompleted: 0,
    speakingMinutes: 0,
    vocabularyWords: 0,
    lastActiveDate: null,
    completedPlanByDate: {},
    weeklyStats: createDefaultWeeklyStats(),
    weekKey: ""
  };
}

function getDefaultProgress() {
  return createDefaultLearnerProgress();
}

function clearLegacyProgressStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(legacyProgressStorageKey);
}

function getProgressStorageKey(userId: number | null = getStoredUserId()) {
  return userId ? `${progressStoragePrefix}:user:${userId}` : `${progressStoragePrefix}:guest`;
}

function normalizeProgress(rawValue: Partial<LearnerProgress>): LearnerProgress {
  const defaultProgress = getDefaultProgress();

  return {
    ...defaultProgress,
    ...rawValue,
    badges: Array.isArray(rawValue.badges) ? rawValue.badges.filter(Boolean) : defaultProgress.badges,
    completedPlanByDate:
      rawValue.completedPlanByDate && typeof rawValue.completedPlanByDate === "object"
        ? rawValue.completedPlanByDate
        : defaultProgress.completedPlanByDate,
    weeklyStats: {
      ...defaultProgress.weeklyStats,
      ...(rawValue.weeklyStats ?? {})
    },
    weekKey: typeof rawValue.weekKey === "string" ? rawValue.weekKey : defaultProgress.weekKey
  };
}

function syncWeek(progress: LearnerProgress, date = new Date()) {
  const currentWeekKey = getWeekKey(date);

  if (progress.weekKey === currentWeekKey) {
    return progress;
  }

  return {
    ...progress,
    weekKey: currentWeekKey,
    weeklyStats: {
      vocabularyWords: 0,
      speakingDrills: 0,
      perfectGrammarDays: 0,
      roleplays: 0,
      articlesRead: 0,
      writingPieces: 0
    }
  };
}

function readStoredProgressValue(progressStorageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(progressStorageKey) ?? window.localStorage.getItem(legacyProgressStorageKey);
}

export function readLearnerProgress(date = new Date(), userId: number | null = getStoredUserId()) {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  const progressStorageKey = getProgressStorageKey(userId);
  const storedValue = readStoredProgressValue(progressStorageKey);

  if (!storedValue) {
    const defaultProgress = getDefaultProgress();
    window.localStorage.setItem(progressStorageKey, JSON.stringify(defaultProgress));
    clearLegacyProgressStorage();
    return defaultProgress;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<LearnerProgress>;
    const normalizedValue = syncWeek(normalizeProgress(parsedValue), date);
    window.localStorage.setItem(progressStorageKey, JSON.stringify(normalizedValue));
    clearLegacyProgressStorage();
    return normalizedValue;
  } catch {
    const defaultProgress = getDefaultProgress();
    window.localStorage.setItem(progressStorageKey, JSON.stringify(defaultProgress));
    clearLegacyProgressStorage();
    return defaultProgress;
  }
}

export function writeLearnerProgress(progress: LearnerProgress, userId: number | null = getStoredUserId()) {
  if (typeof window === "undefined") {
    return;
  }

  const progressStorageKey = getProgressStorageKey(userId);
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  clearLegacyProgressStorage();
  dispatchLearnerProgressChanged(userId);
}

function hasMeaningfulProgress(progress: LearnerProgress) {
  return (
    progress.totalXp > 0 ||
    progress.streakDays > 0 ||
    progress.badges.length > 0 ||
    progress.lessonsCompleted > 0 ||
    progress.speakingMinutes > 0 ||
    progress.vocabularyWords > 0 ||
    progress.lastActiveDate !== null ||
    Object.values(progress.weeklyStats).some((value) => value > 0) ||
    Object.values(progress.completedPlanByDate).some((blocks) => blocks.length > 0)
  );
}

export function activateLearnerProgress(userId: number, date = new Date()) {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  const userStorageKey = getProgressStorageKey(userId);
  const guestStorageKey = getProgressStorageKey(null);
  const userProgress = readLearnerProgress(date, userId);
  const guestProgress = readLearnerProgress(date, null);
  const guestRawValue = readStoredProgressValue(guestStorageKey);
  const shouldAdoptGuestProgress = Boolean(guestRawValue) && !hasMeaningfulProgress(userProgress) && hasMeaningfulProgress(guestProgress);
  const activatedProgress = shouldAdoptGuestProgress ? guestProgress : userProgress;

  window.localStorage.setItem(userStorageKey, JSON.stringify(activatedProgress));

  if (shouldAdoptGuestProgress) {
    window.localStorage.removeItem(guestStorageKey);
  }

  clearLegacyProgressStorage();
  dispatchLearnerProgressChanged(userId);
  return activatedProgress;
}

function addBadge(progress: LearnerProgress, badge: string) {
  if (progress.badges.includes(badge)) {
    return progress;
  }

  return {
    ...progress,
    badges: [...progress.badges, badge]
  };
}

const levelThresholds: Array<{ level: CefrLevel; minXp: number }> = [
  { level: "A0", minXp: 0 },
  { level: "A1", minXp: 180 },
  { level: "A2", minXp: 450 },
  { level: "B1", minXp: 900 },
  { level: "B2", minXp: 1800 },
  { level: "C1", minXp: 3200 }
];

export function getCurrentCefrLevel(totalXp: number) {
  let currentLevel: CefrLevel = "A0";

  for (const threshold of levelThresholds) {
    if (totalXp >= threshold.minXp) {
      currentLevel = threshold.level;
    }
  }

  return currentLevel;
}

export function getLevelIndex(level: CefrLevel) {
  return roadmapLevels.findIndex((item) => item.level === level);
}

function maybeAwardBadges(progress: LearnerProgress) {
  let nextProgress = progress;
  const currentLevel = getCurrentCefrLevel(nextProgress.totalXp);

  if (nextProgress.lessonsCompleted >= 1) {
    nextProgress = addBadge(nextProgress, "Starter Spark");
  }

  if (nextProgress.speakingMinutes >= 5) {
    nextProgress = addBadge(nextProgress, "Mic Friend");
  }

  if (nextProgress.vocabularyWords >= 100) {
    nextProgress = addBadge(nextProgress, "100 Words");
  }

  if (nextProgress.streakDays >= 3) {
    nextProgress = addBadge(nextProgress, "3-Day Streak");
  }

  if (nextProgress.streakDays >= 7) {
    nextProgress = addBadge(nextProgress, "Week Warrior");
  }

  if (nextProgress.streakDays >= 30) {
    nextProgress = addBadge(nextProgress, "Monthly Master");
  }

  if (nextProgress.weeklyStats.roleplays >= 1) {
    nextProgress = addBadge(nextProgress, "First Conversation");
  }

  if (nextProgress.weeklyStats.vocabularyWords >= 50) {
    nextProgress = addBadge(nextProgress, "Vocab Sprint Winner");
  }

  if (nextProgress.weeklyStats.perfectGrammarDays >= 5) {
    nextProgress = addBadge(nextProgress, "Grammar Star");
  }

  if (nextProgress.speakingMinutes >= 600) {
    nextProgress = addBadge(nextProgress, "Speaking Milestone");
  }

  if (getLevelIndex(currentLevel) >= getLevelIndex("A1")) {
    nextProgress = addBadge(nextProgress, "A1 Graduate");
  }

  if (currentLevel === "C1") {
    nextProgress = addBadge(nextProgress, "C1 Champion");
  }

  return nextProgress;
}

function clampToZero(value: number) {
  return value < 0 ? 0 : value;
}

function updateStreak(progress: LearnerProgress, dateKey: string, date = new Date()) {
  if (progress.lastActiveDate === dateKey) {
    return progress;
  }

  const yesterdayKey = getDateKey(addDays(date, -1));

  return {
    ...progress,
    streakDays: progress.lastActiveDate === yesterdayKey ? progress.streakDays + 1 : 1,
    lastActiveDate: dateKey
  };
}

export function toggleDailyPlanBlock(progress: LearnerProgress, block: DailyPlanBlock, date = new Date()) {
  const currentProgress = syncWeek(progress, date);
  const dateKey = getDateKey(date);
  const completedToday = new Set(currentProgress.completedPlanByDate[dateKey] ?? []);
  const isCompleted = completedToday.has(block.id);
  const delta = isCompleted ? -1 : 1;

  if (isCompleted) {
    completedToday.delete(block.id);
  } else {
    completedToday.add(block.id);
  }

  let nextProgress: LearnerProgress = {
    ...currentProgress,
    totalXp: clampToZero(currentProgress.totalXp + block.xp * delta),
    lessonsCompleted: clampToZero(currentProgress.lessonsCompleted + (block.statBoosts.lessonsCompleted ?? 0) * delta),
    speakingMinutes: clampToZero(currentProgress.speakingMinutes + (block.statBoosts.speakingMinutes ?? 0) * delta),
    vocabularyWords: clampToZero(currentProgress.vocabularyWords + (block.statBoosts.vocabularyWords ?? 0) * delta),
    completedPlanByDate: {
      ...currentProgress.completedPlanByDate,
      [dateKey]: Array.from(completedToday)
    },
    weeklyStats: {
      ...currentProgress.weeklyStats,
      ...(block.weeklyMetric
        ? {
            [block.weeklyMetric]: clampToZero(
              currentProgress.weeklyStats[block.weeklyMetric] + (block.weeklyMetricAmount ?? 0) * delta
            )
          }
        : {})
    }
  };

  if (!isCompleted) {
    nextProgress = updateStreak(nextProgress, dateKey, date);
  }

  return maybeAwardBadges(nextProgress);
}

function applyWeeklyStatsDelta(currentStats: WeeklyStats, delta: Partial<WeeklyStats>) {
  return {
    vocabularyWords: clampToZero(currentStats.vocabularyWords + (delta.vocabularyWords ?? 0)),
    speakingDrills: clampToZero(currentStats.speakingDrills + (delta.speakingDrills ?? 0)),
    perfectGrammarDays: clampToZero(currentStats.perfectGrammarDays + (delta.perfectGrammarDays ?? 0)),
    roleplays: clampToZero(currentStats.roleplays + (delta.roleplays ?? 0)),
    articlesRead: clampToZero(currentStats.articlesRead + (delta.articlesRead ?? 0)),
    writingPieces: clampToZero(currentStats.writingPieces + (delta.writingPieces ?? 0))
  };
}

export function applyLearnerProgressDelta(progress: LearnerProgress, delta: LearnerProgressDelta, date = new Date()) {
  let nextProgress = syncWeek(progress, date);

  if (delta.streakActivity) {
    nextProgress = updateStreak(nextProgress, getDateKey(date), date);
  }

  nextProgress = {
    ...nextProgress,
    totalXp: clampToZero(nextProgress.totalXp + (delta.xp ?? 0)),
    lessonsCompleted: clampToZero(nextProgress.lessonsCompleted + (delta.lessonsCompleted ?? 0)),
    speakingMinutes: clampToZero(nextProgress.speakingMinutes + (delta.speakingMinutes ?? 0)),
    vocabularyWords: clampToZero(nextProgress.vocabularyWords + (delta.vocabularyWords ?? 0)),
    weeklyStats: applyWeeklyStatsDelta(nextProgress.weeklyStats, delta.weeklyStats ?? {})
  };

  for (const badge of delta.badges ?? []) {
    nextProgress = addBadge(nextProgress, badge);
  }

  return maybeAwardBadges(nextProgress);
}

export function recordLearnerProgress(delta: LearnerProgressDelta, date = new Date(), userId: number | null = getStoredUserId()) {
  const currentProgress = readLearnerProgress(date, userId);
  const nextProgress = applyLearnerProgressDelta(currentProgress, delta, date);
  writeLearnerProgress(nextProgress, userId);
  return nextProgress;
}

export function getTodayCompletedBlocks(progress: LearnerProgress, date = new Date()) {
  const dateKey = getDateKey(date);
  return progress.completedPlanByDate[dateKey] ?? [];
}

export function getTodayCompletedXp(progress: LearnerProgress, date = new Date()) {
  const completedBlocks = new Set(getTodayCompletedBlocks(progress, date));
  return dailyPlanBlocks.reduce((total, block) => (completedBlocks.has(block.id) ? total + block.xp : total), 0);
}

export function getCurrentChallenge(date = new Date()) {
  const anchorDate = new Date(2025, 0, 6);
  const diffInDays = Math.floor((date.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.abs(Math.floor(diffInDays / 7)) % weeklyChallenges.length;
  return weeklyChallenges[weekIndex];
}

export function getDaysRemainingInWeek(date = new Date()) {
  const day = date.getDay();
  const normalizedDay = day === 0 ? 7 : day;
  return 7 - normalizedDay;
}

export function getChallengeProgress(progress: LearnerProgress, challenge: WeeklyChallenge) {
  return progress.weeklyStats[challenge.metric];
}

export function getProgressClass(percent: number) {
  const bucket = Math.max(0, Math.min(100, Math.round(percent / 5) * 5));
  return `progress-w-${bucket}`;
}

export function formatSpeakingHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)} hrs`;
}



