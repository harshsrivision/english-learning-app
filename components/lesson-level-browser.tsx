"use client";

import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { buildSignupHref } from "@/lib/auth-navigation";
import type { CurriculumLevelSummary } from "@/lib/curriculum";
import {
  buildCurriculumChapterRoute,
  getCurriculumBandBadgeClasses,
  getCurriculumChapterCards,
  getCurriculumChapterKindClasses,
  getCurriculumCompletedSet,
  getCurriculumLevelProgress,
  getCurriculumUnlockedLevelIds,
  isCurriculumChapterUnlocked,
  readCurriculumProgress,
  type CurriculumChapterCard,
  type CurriculumProgress
} from "@/lib/curriculum-lessons";
import { getProgressWidthClass } from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

type LessonLevelBrowserProps = {
  levelId: number;
};

export function LessonLevelBrowser({ levelId }: LessonLevelBrowserProps) {
  const { userId, hasSession, isChecking } = useUserSession();
  const signupHref = buildSignupHref(`/lessons/${levelId}`);
  const [levels, setLevels] = useState<CurriculumLevelSummary[]>([]);
  const [level, setLevel] = useState<CurriculumLevelSummary | null>(null);
  const [chapters, setChapters] = useState<CurriculumChapterCard[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress>({ completedChapterIds: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProgress(readCurriculumProgress(userId));
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadLevel() {
      try {
        setIsLoading(true);
        setError(null);

        const [levelsData, levelData, chaptersData] = await Promise.all([
          apiFetchJson<CurriculumLevelSummary[]>("/api/curriculum/levels", { timeoutMs: 20000 }),
          apiFetchJson<CurriculumLevelSummary>(`/api/curriculum/levels/${levelId}`, { timeoutMs: 20000 }),
          apiFetchJson<CurriculumChapterCard[]>(`/api/curriculum/chapters/${levelId}`, { timeoutMs: 20000 })
        ]);

        if (!ignore) {
          setLevels(levelsData);
          setLevel(levelData);
          setChapters(chaptersData.length ? chaptersData : getCurriculumChapterCards(levelData));
        }
      } catch (requestError) {
        if (!ignore) {
          setError(toApiErrorMessage(requestError, "Level details abhi load nahi ho pa rahe."));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadLevel();

    return () => {
      ignore = true;
    };
  }, [levelId]);

  const completedSet = useMemo(() => getCurriculumCompletedSet(progress), [progress]);
  const unlockedLevelIds = useMemo(() => getCurriculumUnlockedLevelIds(levels, completedSet, hasSession), [completedSet, hasSession, levels]);
  const levelProgress = useMemo(() => (level ? getCurriculumLevelProgress(level, completedSet) : null), [completedSet, level]);
  const isLevelUnlocked = unlockedLevelIds.has(levelId);

  return (
    <main className="section-shell space-y-8">
      <nav className="flex items-center gap-2 text-xs text-stone">
        <Link href="/lessons" aria-label="Open lessons page" className="hover:text-ink">
          Lessons
        </Link>
        <span aria-hidden="true">{"\u203A"}</span>
        <span className="font-semibold text-ink">{level?.title ?? `Level ${levelId}`}</span>
      </nav>

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Level details load ho rahe hain...</div> : null}

      {level && levelProgress ? (
        <>
          {!isLevelUnlocked ? (
            <section className="surface-card p-6 sm:p-8">
              <div className="flex items-start gap-3 text-stone">
                <LockKeyhole className="mt-1 h-5 w-5 text-forest" />
                <div>
                  <h1 className="font-display text-3xl text-ink">Level {level.level} abhi locked hai</h1>
                  <p className="mt-2 text-sm leading-7 text-stone">Pehle previous level ke chapters complete karo. Guest mode mein sirf level 1 available hai.</p>
                </div>
              </div>

              {!isChecking && !hasSession ? (
                <Link
                  href={signupHref}
                  aria-label="Create account to unlock the full level path"
                  className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                >
                  Login karke unlock karo
                </Link>
              ) : (
                <Link
                  href="/lessons"
                  aria-label="Go back to the lessons list"
                  className="mt-6 inline-flex rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  Back to Lessons
                </Link>
              )}
            </section>
          ) : (
            <>
              <section className="surface-card halo-panel p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getCurriculumBandBadgeClasses(level.cefr_band)}>{level.cefr_band}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">Level {level.level}</span>
                </div>
                <h1 className="mt-4 font-display text-4xl text-ink">{level.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">{level.outcome}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone">Chapters</p>
                    <p className="mt-2 text-2xl font-bold text-ink">{level.chapter_count}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone">Lessons</p>
                    <p className="mt-2 text-2xl font-bold text-ink">{level.lesson_count}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone">Progress</p>
                    <p className="mt-2 text-2xl font-bold text-ink">{levelProgress.progressPercent}%</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-stone">
                    <span>{levelProgress.completedCount} of {levelProgress.totalChapters} chapters complete</span>
                    <span>{levelProgress.progressPercent}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-ink/10">
                    <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(levelProgress.progressPercent)}`} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {chapters.map((chapter) => {
                  const isCompleted = completedSet.has(chapter.route_id);
                  const chapterUnlocked = isCurriculumChapterUnlocked(chapters, chapter.route_id, completedSet);
                  const href = buildCurriculumChapterRoute(level.level, chapter.route_id) as Route;

                  return (
                    <article key={chapter.route_id} className={`surface-card p-5 ${!chapterUnlocked ? "opacity-60" : ""}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={getCurriculumChapterKindClasses(chapter.kind)}>{chapter.kind}</span>
                            <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">Chapter {chapter.order_index}</span>
                          </div>
                          <h2 className="mt-3 font-display text-2xl text-ink">{chapter.title}</h2>
                          <p className="mt-2 text-sm leading-7 text-stone">{chapter.summary}</p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm font-semibold text-stone">{chapter.lesson_count} lessons</p>
                          <p className={`mt-2 text-sm font-semibold ${isCompleted ? "text-forest" : chapterUnlocked ? "text-ink" : "text-stone"}`}>
                            {isCompleted ? "Complete" : chapterUnlocked ? "Ready to start" : "Locked"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-stone">
                          {isCompleted ? <CheckCircle2 className="h-4 w-4 text-forest" /> : <LockKeyhole className="h-4 w-4 text-stone" />}
                          <span>{isCompleted ? "Chapter complete" : chapterUnlocked ? "Start from the first lesson inside this chapter" : "Pehle wala lesson complete karo"}</span>
                        </div>

                        {chapterUnlocked ? (
                          <Link
                            href={href}
                            aria-label={`${isCompleted ? "Review" : "Start"} chapter ${chapter.title}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                          >
                            {isCompleted ? "Review" : "Start"}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Chapter ${chapter.title} is locked`}
                            disabled
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-stone"
                          >
                            Locked
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}