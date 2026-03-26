"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { buildSignupHref } from "@/lib/auth-navigation";
import type { CurriculumLesson, CurriculumLevelSummary } from "@/lib/curriculum";
import {
  buildCurriculumChapterRoute,
  buildCurriculumExamples,
  buildCurriculumLevelRoute,
  findCurriculumChapter,
  getCurriculumBandBadgeClasses,
  getCurriculumChapterCards,
  getCurriculumCompletedSet,
  getCurriculumUnlockedLevelIds,
  isCurriculumChapterUnlocked,
  markCurriculumChapterCompleted,
  readCurriculumProgress,
  toCurriculumChapterApiId,
  type CurriculumChapterCard,
  type CurriculumProgress,
  writeCurriculumProgress
} from "@/lib/curriculum-lessons";
import { recordLearnerProgress } from "@/lib/local-progress";
import { useUserSession } from "@/lib/use-user-session";

type ChapterLessonBrowserProps = {
  levelId: number;
  chapterRouteId: string;
};

type ChapterProgressResponse = {
  success?: boolean;
  xpAwarded?: number;
  error?: string;
};

export function ChapterLessonBrowser({ levelId, chapterRouteId }: ChapterLessonBrowserProps) {
  const { userId, hasSession, isChecking } = useUserSession();
  const signupHref = buildSignupHref(`/lessons/${levelId}/${chapterRouteId}`);
  const [levels, setLevels] = useState<CurriculumLevelSummary[]>([]);
  const [level, setLevel] = useState<CurriculumLevelSummary | null>(null);
  const [chapters, setChapters] = useState<CurriculumChapterCard[]>([]);
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress>({ completedChapterIds: [] });
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showNextAction, setShowNextAction] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProgress(readCurriculumProgress(userId));
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadChapter() {
      try {
        setIsLoading(true);
        setError(null);

        const [levelsData, levelData, chapterData, lessonData] = await Promise.all([
          apiFetchJson<CurriculumLevelSummary[]>("/api/curriculum/levels", { timeoutMs: 20000 }),
          apiFetchJson<CurriculumLevelSummary>(`/api/curriculum/levels/${levelId}`, { timeoutMs: 20000 }),
          apiFetchJson<CurriculumChapterCard[]>(`/api/curriculum/chapters/${levelId}`, { timeoutMs: 20000 }),
          apiFetchJson<CurriculumLesson[]>(`/api/curriculum/lessons/${chapterRouteId}`, { timeoutMs: 20000 })
        ]);

        if (!ignore) {
          setLevels(levelsData);
          setLevel(levelData);
          setChapters(chapterData.length ? chapterData : getCurriculumChapterCards(levelData));
          setLessons(lessonData);
          setSelectedLessonIndex(0);
          setSelectedOption(null);
          setFeedbackMessage(null);
          setShowNextAction(false);
          setRecentlyCompleted(false);
          setEarnedXp(50);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(toApiErrorMessage(requestError, "Chapter lesson abhi load nahi ho raha."));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadChapter();

    return () => {
      ignore = true;
    };
  }, [chapterRouteId, levelId]);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowToast(false);
      setShowNextAction(true);
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showToast]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedbackMessage(null);
  }, [selectedLessonIndex]);

  const completedSet = useMemo(() => getCurriculumCompletedSet(progress), [progress]);
  const unlockedLevelIds = useMemo(() => getCurriculumUnlockedLevelIds(levels, completedSet, hasSession), [completedSet, hasSession, levels]);
  const activeChapter = useMemo(() => findCurriculumChapter(level, chapterRouteId) ?? chapters.find((chapter) => chapter.route_id === chapterRouteId) ?? null, [chapterRouteId, chapters, level]);
  const isLevelUnlocked = unlockedLevelIds.has(levelId);
  const isChapterUnlocked = useMemo(() => (activeChapter ? isCurriculumChapterUnlocked(chapters, activeChapter.route_id, completedSet) : false), [activeChapter, chapters, completedSet]);
  const isChapterCompleted = Boolean(activeChapter && completedSet.has(activeChapter.route_id));
  const selectedLesson = lessons[selectedLessonIndex] ?? lessons[0] ?? null;
  const nextChapter = useMemo(() => {
    if (!activeChapter) {
      return null;
    }

    const chapterIndex = chapters.findIndex((chapter) => chapter.route_id === activeChapter.route_id);
    return chapterIndex >= 0 ? chapters[chapterIndex + 1] ?? null : null;
  }, [activeChapter, chapters]);
  const nextHref = nextChapter ? (buildCurriculumChapterRoute(levelId, nextChapter.route_id) as Route) : (buildCurriculumLevelRoute(levelId) as Route);
  const exerciseQuestion = selectedLesson?.quiz[0] ?? null;
  const examples = selectedLesson ? buildCurriculumExamples(selectedLesson) : [];
  const answerOptions = exerciseQuestion?.options?.slice(0, 4) ?? selectedLesson?.content.sentence_patterns.slice(0, 4) ?? [];
  const correctAnswer = exerciseQuestion?.correct_answer ?? answerOptions[0] ?? null;

  function handleOptionSelect(option: string) {
    if (!selectedLesson || !correctAnswer) {
      return;
    }

    setSelectedOption(option);

    if (option === correctAnswer) {
      setFeedbackTone("success");
      setFeedbackMessage("Sahi jawab. Ab chapter complete karke agla step unlock karo.");
      return;
    }

    setFeedbackTone("error");
    setFeedbackMessage("Close tha. Hint dobara padh lo, phir bhi chapter complete karke aage badh sakte ho.");
  }

  async function handleComplete() {
    if (!activeChapter || !selectedLesson || !selectedOption || isCompleting) {
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      const nextProgress = markCurriculumChapterCompleted(progress, activeChapter.route_id);
      let xpAwarded = 50;

      if (userId) {
        const response = await apiFetchJson<ChapterProgressResponse>("chapterProgress", {
          method: "POST",
          timeoutMs: 20000,
          body: JSON.stringify({
            userId,
            lessonId: levelId,
            chapterId: toCurriculumChapterApiId(activeChapter.route_id),
            score: selectedOption === correctAnswer ? 100 : 70
          })
        });

        if (!response.success) {
          throw new Error("Chapter progress save nahi hua.");
        }

        if (typeof response.xpAwarded === "number" && response.xpAwarded > 0) {
          xpAwarded = response.xpAwarded;
        }
      }

      writeCurriculumProgress(nextProgress, userId);
      setProgress(nextProgress);
      recordLearnerProgress({ xp: xpAwarded, lessonsCompleted: 1, streakActivity: true });
      setEarnedXp(xpAwarded);
      setRecentlyCompleted(true);
      setShowNextAction(false);
      setShowToast(true);
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Chapter complete nahi ho paaya."));
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <main className="section-shell space-y-5">
      {showToast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest px-6 py-3 font-bold text-white shadow-float">
          {`+${earnedXp} XP earned!`}
        </div>
      ) : null}

      <nav className="flex items-center gap-2 text-xs text-stone">
        <Link href="/lessons" aria-label="Open lessons page" className="hover:text-ink">
          Lessons
        </Link>
        <span aria-hidden="true">{"\u203A"}</span>
        <Link href={buildCurriculumLevelRoute(levelId) as Route} aria-label={`Open level ${levelId} page`} className="hover:text-ink">
          {level?.title ?? `Level ${levelId}`}
        </Link>
        <span aria-hidden="true">{"\u203A"}</span>
        <span className="font-semibold text-ink">{activeChapter?.title ?? "Chapter"}</span>
      </nav>

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Chapter lesson load ho raha hai...</div> : null}

      {level && activeChapter && selectedLesson ? (
        <>
          {!isLevelUnlocked || !isChapterUnlocked ? (
            <section className="surface-card p-6 sm:p-8">
              <div className="flex items-start gap-3 text-stone">
                <LockKeyhole className="mt-1 h-5 w-5 text-forest" />
                <div>
                  <h1 className="font-display text-3xl text-ink">Yeh chapter abhi locked hai</h1>
                  <p className="mt-2 text-sm leading-7 text-stone">Pehle wala lesson complete karo. Guest mode mein level 1 ke chapters free milte hain.</p>
                </div>
              </div>

              {!isChecking && !hasSession ? (
                <Link
                  href={signupHref}
                  aria-label="Create account to unlock this chapter"
                  className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                >
                  Login karke unlock karo
                </Link>
              ) : (
                <Link
                  href={buildCurriculumLevelRoute(levelId) as Route}
                  aria-label="Go back to the current level page"
                  className="mt-6 inline-flex rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  Back to Level
                </Link>
              )}
            </section>
          ) : (
            <>
              <section className="surface-card halo-panel p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getCurriculumBandBadgeClasses(level.cefr_band)}>{level.cefr_band}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">Chapter {activeChapter.order_index}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{lessons.length} lessons</span>
                </div>
                <h1 className="mt-4 font-display text-4xl text-ink">{activeChapter.title}</h1>
                <p className="mt-2 text-sm leading-7 text-stone">{activeChapter.summary}</p>
                <p className="mt-4 text-sm font-semibold text-forest">{selectedLesson.title}</p>
                <p className="mt-2 text-sm text-stone">{selectedLesson.learning_objective}</p>
              </section>

              <section className="surface-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Lesson Flow</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {lessons.map((lesson, index) => {
                    const isActive = index === selectedLessonIndex;

                    return (
                      <button
                        key={lesson.lesson_id}
                        type="button"
                        aria-label={`Open lesson ${lesson.title}`}
                        onClick={() => setSelectedLessonIndex(index)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-forest text-white" : "border border-ink/10 bg-mist text-ink hover:border-forest/30"}`}
                      >
                        {`Lesson ${String(index + 1).padStart(2, "0")}`}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="surface-card mb-5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">EXPLANATION</p>
                <p className="mt-4 text-sm leading-7 text-ink">{selectedLesson.content.explanation.simple_english}</p>
                <div className="mt-4 rounded-[1.5rem] bg-forest-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Hindi mein samjho</p>
                  <p className="mt-3 text-sm leading-7 text-stone">{selectedLesson.content.explanation.hindi_support}</p>
                </div>
              </section>

              <section className="surface-card mb-5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">EXAMPLES</p>
                <div className="mt-5 space-y-3">
                  {examples.map((example, index) => (
                    <div key={`${selectedLesson.lesson_id}-example-${index}`} className="rounded-r-2xl border-l-4 border-forest bg-mist px-5 py-4">
                      <p className="text-sm font-semibold text-ink">{example.english}</p>
                      <p className="mt-1 text-xs text-stone">{example.hindi}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card mb-5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">PRACTICE</p>
                <h2 className="mt-4 font-display text-2xl text-ink">{exerciseQuestion?.question ?? selectedLesson.title}</h2>
                <p className="mb-6 mt-1 text-sm italic text-stone">{selectedLesson.content.explanation.hindi_support}</p>

                <div className="grid grid-cols-2 gap-3">
                  {answerOptions.map((option) => {
                    let buttonClass = "rounded-[1.5rem] border border-ink/10 bg-mist px-5 py-4 text-left text-sm hover:border-forest/30";

                    if (selectedOption) {
                      if (option === correctAnswer) {
                        buttonClass = "rounded-[1.5rem] border border-green-600 bg-green-50 px-5 py-4 text-left text-sm text-green-800";
                      } else if (option === selectedOption) {
                        buttonClass = "rounded-[1.5rem] border border-red-400 bg-red-50 px-5 py-4 text-left text-sm text-red-700";
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        aria-label={`Choose option ${option}`}
                        onClick={() => handleOptionSelect(option)}
                        className={buttonClass}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {feedbackMessage ? (
                  <p className={`mt-5 rounded-[1.25rem] px-4 py-3 text-sm ${feedbackTone === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                    {feedbackMessage}
                  </p>
                ) : null}

                <button
                  type="button"
                  aria-label="Mark the current chapter complete"
                  disabled={!selectedOption || isCompleting || isChapterCompleted}
                  onClick={() => void handleComplete()}
                  className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isChapterCompleted ? "Completed" : isCompleting ? "Saving..." : `Mark Complete ${"\u2713"}`}
                </button>

                {showNextAction || (isChapterCompleted && !recentlyCompleted) ? (
                  <div>
                    <Link
                      href={nextHref}
                      aria-label={nextChapter ? `Open next chapter ${nextChapter.title}` : `Go back to level ${level.title}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/10 px-6 py-3 text-sm font-bold text-ink transition hover:border-forest hover:text-forest"
                    >
                      {nextChapter ? `Next Lesson ${"\u2192"}` : `Back to Level ${"\u2192"}`}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
