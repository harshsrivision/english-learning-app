CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'hi',
  current_level proficiency_level NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  level proficiency_level NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  focus TEXT NOT NULL,
  hindi_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_user_lessons_user_unlock ON user_lessons(user_id, is_unlocked);

CREATE TABLE grammar_topics (
  id BIGSERIAL PRIMARY KEY,
  english_title TEXT NOT NULL,
  hindi_title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  example TEXT NOT NULL,
  level proficiency_level NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vocabulary_terms (
  id BIGSERIAL PRIMARY KEY,
  english TEXT NOT NULL,
  hindi TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_sentence TEXT NOT NULL,
  level proficiency_level NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_scenarios (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  difficulty proficiency_level NOT NULL,
  target_outcome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
  scenario_id BIGINT REFERENCES conversation_scenarios(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  learner_transcript TEXT NOT NULL,
  ai_feedback TEXT NOT NULL,
  hindi_feedback TEXT NOT NULL,
  fluency_score NUMERIC(5,2) NOT NULL,
  grammar_score NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pronunciation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL,
  issue_details JSONB NOT NULL,
  hindi_tips JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id BIGINT NOT NULL REFERENCES vocabulary_terms(id) ON DELETE CASCADE,
  familiarity_score INTEGER NOT NULL CHECK (familiarity_score BETWEEN 1 AND 5),
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE (user_id, vocabulary_id)
);
