import type { CefrLevel } from "./app-data";

export type CurriculumLessonTitle = {
  lesson_id: string;
  order_index: number;
  title: string;
};

export type CurriculumChapterSummary = {
  chapter_id: string;
  order_index: number;
  title: string;
  summary: string;
  lesson_titles: CurriculumLessonTitle[];
};

export type CurriculumLevelSummary = {
  level: number;
  slug: string;
  title: string;
  cefr_band: string;
  outcome: string;
  chapter_count: number;
  lesson_count: number;
  chapters: CurriculumChapterSummary[];
};

export type CurriculumStructure = {
  course_id: string;
  version: string;
  title: string;
  outcome: string;
  levels: CurriculumLevelSummary[];
};

export type CurriculumSystems = {
  grammar_system: {
    design_principles: string[];
    coverage: string[];
  };
  vocabulary_system: {
    target_exposures: number;
    categories: string[];
    approach: string;
    revision_cycles: string[];
    spaced_repetition_days: number[];
  };
  speaking_system: {
    daily_speaking_prompt_model: string;
    role_play_ladders: string[];
    confidence_builders: string[];
  };
  progression_system: {
    unlock_logic: {
      first_lesson_unlocked_by_default: boolean;
      next_lesson_unlocks_after_completion: boolean;
      next_chapter_unlocks_after_all_chapter_lessons_completed: boolean;
      next_level_unlocks_after_previous_level_completed: boolean;
    };
    mastery_rules: string[];
  };
};

export type CurriculumVocabularyItem = {
  term: string;
  meaning: string;
  example: string;
  usage_context: string;
  category: string;
  review_bucket: string;
};

export type CurriculumConversationTurn = {
  speaker: string;
  line: string;
};

export type CurriculumConversationExample = {
  scenario: string;
  dialogue: CurriculumConversationTurn[];
};

export type CurriculumQuizQuestion = {
  question: string;
  options: string[];
  correct_answer: string;
};

export type CurriculumLesson = {
  level: number;
  level_title: string;
  cefr_band: string;
  chapter: string;
  chapter_id: string;
  lesson_id: string;
  order_index: number;
  global_order_index: number;
  title: string;
  learning_objective: string;
  grammar_topic: {
    name: string;
    why_it_matters: string;
    key_points: string[];
  };
  vocabulary_list: CurriculumVocabularyItem[];
  content: {
    explanation: {
      simple_english: string;
      hindi_support: string;
    };
    sentence_patterns: string[];
    real_life_conversation_examples: CurriculumConversationExample[];
  };
  exercises: {
    speaking_practice_task: {
      prompt: string;
      steps: string[];
      success_criteria: string[];
      think_in_english_drill: string;
    };
    writing_practice_task: {
      prompt: string;
      checklist: string[];
    };
    micro_drills: Array<{
      type: string;
      instruction: string;
    }>;
  };
  quiz: CurriculumQuizQuestion[];
  answers: Array<{
    question_number: number;
    correct_answer: string;
  }>;
  common_mistakes: string[];
  confidence_tip: string;
  revision: {
    spaced_repetition_days: number[];
    review_targets: string[];
    retrieval_prompts: string[];
    recommended_mode: string;
  };
  unlock_logic: {
    unlocked_by_default: boolean;
    requires_completion_of: string | null;
    chapter_unlock_rule: string;
    level_unlock_rule: string;
  };
  chapter_summary: string;
};

export function getCurriculumStats(structure: CurriculumStructure) {
  const chapterCount = structure.levels.reduce((total, level) => total + level.chapter_count, 0);
  const lessonCount = structure.levels.reduce((total, level) => total + level.lesson_count, 0);

  return {
    levelCount: structure.levels.length,
    chapterCount,
    lessonCount
  };
}

export function mapRoadmapLevelToCurriculumLevel(level: CefrLevel) {
  switch (level) {
    case "A0":
    case "A1":
      return 1;
    case "A2":
      return 2;
    case "B1":
      return 3;
    case "B2":
    case "C1":
      return 4;
    default:
      return 1;
  }
}

export function getCurriculumLevelHash(level: number) {
  return `level-${level}`;
}

export function buildCurriculumLevelHref(level: number) {
  return `/curriculum#${getCurriculumLevelHash(level)}`;
}

export function groupCurriculumLessonsByChapter(level: CurriculumLevelSummary | null, lessons: CurriculumLesson[]) {
  if (!level) {
    return [];
  }

  return level.chapters.map((chapter) => ({
    ...chapter,
    lessons: lessons
      .filter((lesson) => lesson.chapter_id === chapter.chapter_id)
      .sort((left, right) => left.order_index - right.order_index)
  }));
}

