export type Level = "beginner" | "intermediate" | "advanced" | "professional";

export type Lesson = {
  id: number;
  title: string;
  level: Level;
  durationMinutes: number;
  focus: string;
  hindiSummary: string;
};

export type GrammarTopic = {
  id: number;
  englishTitle: string;
  hindiTitle: string;
  explanation: string;
  example: string;
  level: Level;
};

export type VocabularyTerm = {
  id: number;
  english: string;
  hindi: string;
  category: string;
  usage: string;
  level: Level;
};

export type Scenario = {
  id: number;
  title: string;
  context: string;
  difficulty: Level;
  targetOutcome: string;
};

export type LearnerSnapshot = {
  name: string;
  currentLevel: Level;
  nextLevel: Level;
  progressToNextLevel: number;
  streakDays: number;
  speakingScore: number;
  pronunciationScore: number;
  vocabularyMastered: number;
  grammarCompleted: number;
  totalLessonsCompleted: number;
};

export type SkillProgress = {
  skill: string;
  percent: number;
  note: string;
};

export type WeeklyGoal = {
  title: string;
  target: string;
  progress: number;
};

export type RecentActivity = {
  title: string;
  result: string;
  timeLabel: string;
};
