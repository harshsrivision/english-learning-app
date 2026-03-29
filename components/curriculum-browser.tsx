"use client";

import { ArrowRight, BookOpenCheck, CheckCircle2, Languages, Layers3, LockKeyhole, MessagesSquare, RefreshCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { buildLoginHref, buildSignupHref } from "@/lib/auth-navigation";
import {
  getCurriculumLevelHash,
  getCurriculumStats,
  groupCurriculumLessonsByChapter,
  type CurriculumLesson,
  type CurriculumStructure,
  type CurriculumSystems
} from "@/lib/curriculum";
import { useUserSession } from "@/lib/use-user-session";

function formatLessonOrder(orderIndex: number) {
  return String(orderIndex).padStart(2, "0");
}

function readLevelFromHash(maxLevel: number) {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.hash.match(/^#level-(\d+)$/);

  if (!match) {
    return null;
  }

  const parsedLevel = Number(match[1]);

  if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > maxLevel) {
    return null;
  }

  return parsedLevel;
}

function syncLevelHash(level: number) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}#${getCurriculumLevelHash(level)}`;
  window.history.replaceState(null, "", nextUrl);
}

const detailCardClass = "rounded-[1.75rem] border border-ink/10 bg-white p-5";

export function CurriculumBrowser() {
  const { hasSession, isChecking } = useUserSession();
  const loginHref = buildLoginHref("/curriculum");
  const signupHref = buildSignupHref("/curriculum");
  const [structure, setStructure] = useState<CurriculumStructure | null>(null);
  const [systems, setSystems] = useState<CurriculumSystems | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonCache, setLessonCache] = useState<Record<number, CurriculumLesson[]>>({});
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCourse() {
      try {
        setIsCourseLoading(true);
        setError(null);

        const [structureData, systemsData] = await Promise.all([
          apiFetchJson<CurriculumStructure>("curriculumStructure"),
          apiFetchJson<CurriculumSystems>("curriculumSystems")
        ]);

        if (ignore) {
          return;
        }

        setStructure(structureData);
        setSystems(systemsData);
        const hashedLevel = readLevelFromHash(structureData.levels.length);
        setSelectedLevel(hashedLevel ?? structureData.levels[0]?.level ?? 1);
      } catch (loadError) {
        if (!ignore) {
          setError(toApiErrorMessage(loadError, "Curriculum abhi load nahi ho pa raha. Thodi der mein phir try karo."));
        }
      } finally {
        if (!ignore) {
          setIsCourseLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!structure) {
      return;
    }

    const levelExists = structure.levels.some((level) => level.level === selectedLevel);

    if (!levelExists) {
      setSelectedLevel(structure.levels[0]?.level ?? 1);
      return;
    }

    syncLevelHash(selectedLevel);

    if (lessonCache[selectedLevel]) {
      return;
    }

    let ignore = false;

    async function loadLevelLessons() {
      try {
        setIsLevelLoading(true);
        setError(null);

        const lessons = await apiFetchJson<CurriculumLesson[]>(`api/curriculum/levels/${selectedLevel}/lessons`);

        if (!ignore) {
          setLessonCache((current) => ({
            ...current,
            [selectedLevel]: lessons
          }));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(toApiErrorMessage(loadError, "Selected level ke lessons load nahi ho pa rahe."));
        }
      } finally {
        if (!ignore) {
          setIsLevelLoading(false);
        }
      }
    }

    void loadLevelLessons();

    return () => {
      ignore = true;
    };
  }, [lessonCache, selectedLevel, structure]);

  const currentLevel = structure?.levels.find((level) => level.level === selectedLevel) ?? null;
  const currentLessons = useMemo(() => lessonCache[selectedLevel] ?? [], [lessonCache, selectedLevel]);

  useEffect(() => {
    if (!currentLessons.length) {
      return;
    }

    const selectedLessonStillExists = selectedLessonId ? currentLessons.some((lesson) => lesson.lesson_id === selectedLessonId) : false;

    if (!selectedLessonStillExists) {
      setSelectedLessonId(currentLessons[0]?.lesson_id ?? null);
    }
  }, [currentLessons, selectedLessonId]);

  const selectedLesson = currentLessons.find((lesson) => lesson.lesson_id === selectedLessonId) ?? currentLessons[0] ?? null;
  const lessonGroups = useMemo(() => groupCurriculumLessonsByChapter(currentLevel, currentLessons), [currentLevel, currentLessons]);
  const stats = structure ? getCurriculumStats(structure) : null;

  if (isCourseLoading) {
    return (
      <main className="section-shell space-y-6">
        <section className="surface-card halo-panel p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Curriculum</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Loading the complete English system...</h1>
          <p className="mt-4 text-sm text-stone">Levels, chapters, and lesson details load ho rahe hain.</p>
        </section>
      </main>
    );
  }

  if (!structure || !systems || !stats) {
    return (
      <main className="section-shell">
        <section className="surface-card p-6 sm:p-8">
          <h1 className="font-display text-3xl text-ink">Curriculum unavailable</h1>
          <p className="mt-3 text-sm text-stone">{error ?? "Curriculum data missing hai."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="section-shell space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.95fr]">
        <div className="surface-card halo-panel p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Complete Curriculum</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{structure.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone">{structure.outcome}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">{stats.levelCount} levels</span>
            <span className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">{stats.chapterCount} chapters</span>
            <span className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">{stats.lessonCount} lessons</span>
            <span className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">{systems.vocabulary_system.target_exposures}+ vocabulary exposures</span>
          </div>

          {!isChecking && !hasSession ? (
            <div className="mt-8 rounded-[1.75rem] border border-forest/15 bg-white/90 p-5">
              <p className="text-sm font-semibold text-forest">Account ke saath learning tools ek jagah milte hain while you explore the new curriculum.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={signupHref} aria-label="Create account for curriculum access" className="inline-flex items-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark">
                  Start Free
                </Link>
                <Link href={loginHref} aria-label="Log in to continue learning" className="inline-flex items-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest/40 hover:text-forest">
                  Login
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <article className="surface-card p-5">
            <div className="flex items-center gap-3 text-forest">
              <Layers3 className="h-5 w-5" />
              <h2 className="font-display text-2xl text-ink">Grammar</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone">{systems.grammar_system.design_principles[0]}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-stone">Coverage</p>
            <p className="mt-2 text-sm text-stone">{systems.grammar_system.coverage.slice(0, 4).join(" | ")}</p>
          </article>

          <article className="surface-card p-5">
            <div className="flex items-center gap-3 text-forest">
              <BookOpenCheck className="h-5 w-5" />
              <h2 className="font-display text-2xl text-ink">Vocabulary</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone">{systems.vocabulary_system.approach}</p>
            <p className="mt-3 text-sm font-semibold text-ink">Spaced repetition: {systems.vocabulary_system.spaced_repetition_days.join(", ")} days</p>
          </article>

          <article className="surface-card p-5">
            <div className="flex items-center gap-3 text-forest">
              <MessagesSquare className="h-5 w-5" />
              <h2 className="font-display text-2xl text-ink">Speaking</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone">{systems.speaking_system.daily_speaking_prompt_model}</p>
            <p className="mt-3 text-sm font-semibold text-ink">Ladder: {systems.speaking_system.role_play_ladders.join(" -> ")}</p>
          </article>

          <article className="surface-card p-5">
            <div className="flex items-center gap-3 text-forest">
              <LockKeyhole className="h-5 w-5" />
              <h2 className="font-display text-2xl text-ink">Unlock Logic</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone">Lesson by lesson progression with chapter and level gates is built into the curriculum metadata.</p>
            <p className="mt-3 text-sm font-semibold text-ink">Mastery rule: {systems.progression_system.mastery_rules[0]}</p>
          </article>
        </div>
      </section>

      <section className="surface-card p-4 sm:p-6" id={getCurriculumLevelHash(selectedLevel)}>
        <div className="flex flex-wrap gap-3">
          {structure.levels.map((level) => {
            const isActive = level.level === selectedLevel;

            return (
              <button
                key={level.level}
                type="button"
                aria-label={`Open curriculum level ${level.level} ${level.title}`}
                aria-pressed={isActive}
                onClick={() => {
                  startTransition(() => {
                    setSelectedLevel(level.level);
                    setSelectedLessonId(null);
                  });
                }}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-forest text-white" : "border border-ink/10 bg-white text-ink hover:border-forest/30 hover:text-forest"
                }`}
              >
                {`Level ${level.level}: ${level.title}`}
              </button>
            );
          })}
        </div>

        {currentLevel ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">{currentLevel.cefr_band}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{currentLevel.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone">{currentLevel.outcome}</p>
            </div>
            <div className="rounded-[1.75rem] border border-ink/10 bg-mist p-5">
              <p className="text-sm font-semibold text-ink">Level snapshot</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone">Chapters</p>
                  <p className="mt-1 text-2xl font-bold text-ink">{currentLevel.chapter_count}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone">Lessons</p>
                  <p className="mt-1 text-2xl font-bold text-ink">{currentLevel.lesson_count}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone">Focus</p>
                  <p className="mt-1 text-sm font-semibold text-ink">Grammar, speaking, writing, quiz</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.3fr]">
        <div className="space-y-5">
          {lessonGroups.map((chapter) => {
            const chapterIsActive = chapter.chapter_id === selectedLesson?.chapter_id;

            return (
              <article key={chapter.chapter_id} className={`surface-card p-5 ${chapterIsActive ? "border-forest/25" : ""}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Chapter {chapter.order_index}</p>
                    <h3 className="mt-2 font-display text-2xl text-ink">{chapter.title}</h3>
                  </div>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{chapter.lessons.length} lessons</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone">{chapter.summary}</p>

                <div className="mt-5 space-y-3">
                  {chapter.lessons.map((lesson) => {
                    const isSelected = lesson.lesson_id === selectedLesson?.lesson_id;

                    return (
                      <button
                        key={lesson.lesson_id}
                        type="button"
                        aria-label={`Select lesson ${lesson.title}`}
                        onClick={() => {
                          startTransition(() => {
                            setSelectedLessonId(lesson.lesson_id);
                          });
                        }}
                        className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                          isSelected ? "border-forest/30 bg-forest/5" : "border-ink/10 bg-white hover:border-forest/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">Lesson {formatLessonOrder(lesson.order_index)}</p>
                            <h4 className="mt-2 text-base font-semibold text-ink">{lesson.title}</h4>
                          </div>
                          <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${isSelected ? "text-forest" : "text-stone"}`} />
                        </div>
                        <p className="mt-2 text-sm text-stone">{lesson.grammar_topic.name}</p>
                        <p className="mt-2 text-xs text-stone">{lesson.unlock_logic.chapter_unlock_rule}</p>
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className="surface-card p-6 sm:p-7">
          {selectedLesson ? (
            <div className="space-y-6">
              <header>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-white">{`Level ${selectedLesson.level}`}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{selectedLesson.cefr_band}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{selectedLesson.chapter}</span>
                </div>
                <h2 className="mt-4 font-display text-4xl text-ink">{selectedLesson.title}</h2>
                <p className="mt-3 text-base leading-7 text-stone">{selectedLesson.learning_objective}</p>
              </header>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <Languages className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Explanation</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone">{selectedLesson.content.explanation.simple_english}</p>
                  <p className="mt-4 rounded-[1.2rem] bg-mist px-4 py-3 text-sm leading-7 text-stone">{selectedLesson.content.explanation.hindi_support}</p>
                </article>

                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Grammar Focus</h3>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">{selectedLesson.grammar_topic.name}</p>
                  <p className="mt-3 text-sm leading-7 text-stone">{selectedLesson.grammar_topic.why_it_matters}</p>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    {selectedLesson.grammar_topic.key_points.map((point) => (
                      <p key={point}>- {point}</p>
                    ))}
                  </div>
                </article>
              </section>

              <section className={detailCardClass}>
                <h3 className="font-display text-2xl text-ink">Sentence Patterns</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedLesson.content.sentence_patterns.map((pattern) => (
                    <span key={pattern} className="rounded-full border border-forest/20 bg-forest/5 px-4 py-2 text-sm font-semibold text-forest">
                      {pattern}
                    </span>
                  ))}
                </div>
              </section>

              <section className={detailCardClass}>
                <h3 className="font-display text-2xl text-ink">Vocabulary</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {selectedLesson.vocabulary_list.map((item) => (
                    <article key={`${selectedLesson.lesson_id}-${item.term}`} className="rounded-[1.35rem] border border-ink/10 bg-mist p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-ink">{item.term}</h4>
                        <span className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">{item.review_bucket}</span>
                      </div>
                      <p className="mt-2 text-sm text-stone">{item.meaning}</p>
                      <p className="mt-3 text-sm leading-6 text-ink">{item.example}</p>
                      <p className="mt-2 text-xs text-stone">{item.category} - {item.usage_context}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={detailCardClass}>
                <h3 className="font-display text-2xl text-ink">Real-Life Conversations</h3>
                <div className="mt-5 space-y-4">
                  {selectedLesson.content.real_life_conversation_examples.map((conversation) => (
                    <article key={`${selectedLesson.lesson_id}-${conversation.scenario}`} className="rounded-[1.35rem] border border-ink/10 bg-mist p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">{conversation.scenario}</p>
                      <div className="mt-4 space-y-3">
                        {conversation.dialogue.map((turn, index) => (
                          <div key={`${conversation.scenario}-${turn.speaker}-${index}`} className="rounded-[1.1rem] bg-white px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">{turn.speaker}</p>
                            <p className="mt-1 text-sm leading-7 text-ink">{turn.line}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <MessagesSquare className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Speaking Task</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone">{selectedLesson.exercises.speaking_practice_task.prompt}</p>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    {selectedLesson.exercises.speaking_practice_task.steps.map((step) => (
                      <p key={step}>- {step}</p>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Think in English drill</p>
                  <p className="mt-2 text-sm leading-7 text-stone">{selectedLesson.exercises.speaking_practice_task.think_in_english_drill}</p>
                </article>

                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Writing Task</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone">{selectedLesson.exercises.writing_practice_task.prompt}</p>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    {selectedLesson.exercises.writing_practice_task.checklist.map((item) => (
                      <p key={item}>- {item}</p>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Micro drills</p>
                  <div className="mt-2 space-y-2 text-sm text-stone">
                    {selectedLesson.exercises.micro_drills.map((drill) => (
                      <p key={`${drill.type}-${drill.instruction}`}>- {drill.instruction}</p>
                    ))}
                  </div>
                </article>
              </section>

              <section className={detailCardClass}>
                <h3 className="font-display text-2xl text-ink">Quiz and Answers</h3>
                <div className="mt-5 space-y-4">
                  {selectedLesson.quiz.map((question, index) => (
                    <article key={`${selectedLesson.lesson_id}-quiz-${index + 1}`} className="rounded-[1.35rem] border border-ink/10 bg-mist p-4">
                      <p className="text-sm font-semibold text-ink">{index + 1}. {question.question}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.options.map((option) => {
                          const isCorrect = option === question.correct_answer;

                          return (
                            <span
                              key={option}
                              className={`rounded-full px-3 py-2 text-sm ${
                                isCorrect ? "bg-forest text-white" : "border border-ink/10 bg-white text-stone"
                              }`}
                            >
                              {option}
                            </span>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-forest">Correct answer: {question.correct_answer}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className={detailCardClass}>
                  <h3 className="font-display text-2xl text-ink">Common Mistakes</h3>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    {selectedLesson.common_mistakes.map((mistake) => (
                      <p key={mistake}>- {mistake}</p>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Confidence tip</p>
                  <p className="mt-2 text-sm leading-7 text-stone">{selectedLesson.confidence_tip}</p>
                </article>

                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <RefreshCcw className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Revision Loop</h3>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Days: {selectedLesson.revision.spaced_repetition_days.join(", ")}</p>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    {selectedLesson.revision.retrieval_prompts.map((prompt) => (
                      <p key={prompt}>- {prompt}</p>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Recommended mode: {selectedLesson.revision.recommended_mode}</p>
                </article>

                <article className={detailCardClass}>
                  <div className="flex items-center gap-3 text-forest">
                    <LockKeyhole className="h-5 w-5" />
                    <h3 className="font-display text-2xl text-ink">Unlock Rules</h3>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-stone">
                    <p>- {selectedLesson.unlock_logic.chapter_unlock_rule}</p>
                    <p>- {selectedLesson.unlock_logic.level_unlock_rule}</p>
                    <p>- Requires completion of: {selectedLesson.unlock_logic.requires_completion_of ?? "No previous lesson"}</p>
                  </div>
                </article>

                <article className={detailCardClass}>
                  <h3 className="font-display text-2xl text-ink">Chapter Purpose</h3>
                  <p className="mt-4 text-sm leading-7 text-stone">{selectedLesson.chapter_summary}</p>
                  <p className="mt-4 text-sm font-semibold text-ink">Speaking ladder</p>
                  <p className="mt-2 text-sm leading-7 text-stone">{systems.speaking_system.role_play_ladders.join(" -> ")}</p>
                </article>
              </section>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-ink/10 bg-mist p-6">
              <h2 className="font-display text-3xl text-ink">Pick a lesson</h2>
              <p className="mt-3 text-sm text-stone">{isLevelLoading ? "Selected level ke lessons load ho rahe hain..." : "Chapter list se koi lesson choose karo to uska full breakdown yahan dikhega."}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}




