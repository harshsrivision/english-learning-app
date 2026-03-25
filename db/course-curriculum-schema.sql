CREATE TABLE IF NOT EXISTS course_levels (
  level_id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cefr_band TEXT NOT NULL,
  outcome TEXT NOT NULL,
  chapter_count INTEGER NOT NULL,
  lesson_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_chapters (
  chapter_id TEXT PRIMARY KEY,
  level_id INTEGER NOT NULL REFERENCES course_levels(level_id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(level_id, order_index)
);

CREATE TABLE IF NOT EXISTS course_lessons (
  lesson_id TEXT PRIMARY KEY,
  level_id INTEGER NOT NULL REFERENCES course_levels(level_id) ON DELETE CASCADE,
  level_title TEXT NOT NULL,
  cefr_band TEXT NOT NULL,
  chapter_id TEXT NOT NULL REFERENCES course_chapters(chapter_id) ON DELETE CASCADE,
  chapter_title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  global_order_index INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  learning_objective TEXT NOT NULL,
  grammar_topic JSONB NOT NULL,
  content JSONB NOT NULL,
  vocabulary_list JSONB NOT NULL,
  exercises JSONB NOT NULL,
  quiz JSONB NOT NULL,
  answers JSONB NOT NULL,
  common_mistakes JSONB NOT NULL,
  confidence_tip TEXT NOT NULL,
  revision JSONB NOT NULL,
  unlock_logic JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_course_chapters_level_order ON course_chapters(level_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_level_order ON course_lessons(level_id, global_order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_chapter_order ON course_lessons(chapter_id, order_index);
