export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";

export type ChapterType = "vocabulary" | "grammar" | "speaking" | "listening" | "quiz";

export type ChapterExercise = {
  question: string;
  options: string[];
  answer: string;
  hindiHint: string;
};

export type ChapterContent = {
  explanation: string;
  hindiExplanation: string;
  examples: string[];
  hindiTranslations: string[];
  exercise: ChapterExercise;
};

export type LessonSummary = {
  id: number;
  title: string;
  cefrLevel: CefrLevel;
  durationMinutes: number;
  focus: string;
  hindiSummary: string;
  unlockRequirement: number | null;
  isUnlocked?: boolean;
  completedChapters?: number;
  totalChapters?: number;
  progressPercent?: number;
};

export type LessonChapter = {
  id: string;
  title: string;
  hindiTitle: string;
  type: ChapterType;
  content: ChapterContent;
  isCompleted?: boolean;
};

export type LessonDetail = LessonSummary & {
  chapters: LessonChapter[];
  totalChapters: number;
  completedChapters: number;
};

export type VocabularyCategory =
  | "Work"
  | "Business"
  | "Daily Life"
  | "Travel"
  | "Personality"
  | "Communication"
  | "Meetings"
  | "Interview"
  | "Leadership"
  | "Social";

export type VocabularyTerm = {
  id: number;
  english: string;
  hindi: string;
  hindiPronunciation: string;
  category: VocabularyCategory;
  cefrLevel: CefrLevel;
  usage: string;
  hindiUsage: string;
  useCases: string[];
  memoryTip: string;
  synonyms: string[];
};

export const genericLearningErrorMessage = "Kuch problem aayi, thodi der mein try karo";
export const lockedLessonSignupMessage = "Aage ke lessons unlock karne ke liye account banao";

export const lessonLevelMeta: Record<CefrLevel, { title: string; subtitle: string }> = {
  A0: { title: "Absolute Beginner", subtitle: "English ki bilkul shuruaat" },
  A1: { title: "Beginner", subtitle: "Rozmarra English ki shuruaat" },
  A2: { title: "Elementary", subtitle: "Basic se practical bolna" },
  B1: { title: "Intermediate", subtitle: "Office aur interview mein flow banana" },
  B2: { title: "Upper Intermediate", subtitle: "Professional English ko polish karna" },
  C1: { title: "Advanced", subtitle: "Leadership aur public speaking level" }
};

export function getLevelBadgeClasses(level: CefrLevel) {
  switch (level) {
    case "A0":
      return "rounded-full bg-stone/10 px-3 py-1 text-xs font-bold text-stone";
    case "A1":
    case "A2":
      return "rounded-full bg-forest-soft px-3 py-1 text-xs font-bold text-forest";
    case "B1":
      return "rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold";
    case "B2":
      return "rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold";
    case "C1":
      return "rounded-full bg-ink/10 px-3 py-1 text-xs font-bold text-ink";
  }
}

export function getTypeBadgeClasses(type: ChapterType) {
  switch (type) {
    case "vocabulary":
      return "rounded-full bg-sky px-3 py-1 text-xs font-semibold text-blue-700";
    case "grammar":
      return "rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest";
    case "speaking":
      return "rounded-full bg-clay/10 px-3 py-1 text-xs font-semibold text-clay";
    case "quiz":
      return "rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold";
    case "listening":
      return "rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink";
  }
}

export function getProgressWidthClass(percent: number) {
  const bucket = Math.max(0, Math.min(100, Math.round(percent / 5) * 5));
  return `progress-w-${bucket}`;
}

export function groupLessonsByLevel(lessons: LessonSummary[]) {
  return ["A0", "A1", "A2", "B1", "B2", "C1"].map((level) => ({
    level: level as CefrLevel,
    lessons: lessons.filter((lesson) => lesson.cefrLevel === level)
  }));
}

export function getLessonProgressPercent(completedChapters: number, totalChapters: number) {
  if (!totalChapters) {
    return 0;
  }

  return Math.round((completedChapters / totalChapters) * 100);
}

export function getNextIncompleteChapter(chapters: LessonChapter[]) {
  return chapters.find((chapter) => !chapter.isCompleted) ?? chapters[0] ?? null;
}
