"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetchJson } from "@/lib/api";
import { readGuestCompletedChapterIds } from "@/lib/guest-learning-progress";
import {
  genericLearningErrorMessage,
  getLevelBadgeClasses,
  getLessonProgressPercent,
  getProgressWidthClass,
  groupLessonsByLevel,
  lessonLevelMeta,
  lockedLessonSignupMessage,
  type LessonSummary
} from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

function getGuestCompletedCount(lessonId: number, completedChapterIds: string[]) {
  const prefix = `l${String(lessonId).padStart(2, "0")}-`;
  return completedChapterIds.filter((chapterId) => chapterId.startsWith(prefix)).length;
}

function getLessonButtonLabel(lesson: LessonSummary) {
  const completedChapters = lesson.completedChapters ?? 0;
  const totalChapters = lesson.totalChapters ?? 0;

  if (totalChapters > 0 && completedChapters >= totalChapters) {
    return "Review";
  }

  if (completedChapters > 0) {
    return "Continue";
  }

  return "Start";
}

function buildLessonHref(lessonId: number) {
  return `/lessons/${lessonId}` as Route;
}

function buildLessonSignupHref(lessonId: number) {
  return `/signup?next=${encodeURIComponent(`/lessons/${lessonId}`)}&message=${encodeURIComponent(lockedLessonSignupMessage)}` as Route;
}

export function LessonsLibrary() {
  const { userId, isChecking } = useUserSession();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [guestCompletedChapterIds, setGuestCompletedChapterIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      return;
    }

    setGuestCompletedChapterIds(readGuestCompletedChapterIds());
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadLessons() {
      try {
        setIsLoading(true);
        setError(null);

        const endpoint = userId ? `lessons?userId=${userId}` : "lessons";
        const data = await apiFetchJson<LessonSummary[]>(endpoint, { timeoutMs: 20000 });

        if (!ignore) {
          setLessons(data);
        }
      } catch {
        if (!ignore) {
          setError(genericLearningErrorMessage);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadLessons();

    return () => {
      ignore = true;
    };
  }, [userId]);

  const displayLessons = useMemo(() => {
    return lessons.map((lesson) => {
      if (userId) {
        return lesson;
      }

      const completedChapters = getGuestCompletedCount(lesson.id, guestCompletedChapterIds);
      const totalChapters = lesson.totalChapters ?? 0;

      return {
        ...lesson,
        isUnlocked: lesson.id === 1,
        completedChapters,
        totalChapters,
        progressPercent: getLessonProgressPercent(completedChapters, totalChapters)
      };
    });
  }, [guestCompletedChapterIds, lessons, userId]);

  const groupedLessons = groupLessonsByLevel(displayLessons);

  return (
    <main className="section-shell space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Lessons</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Step-by-Step English Lessons</h1>
        <p className="mt-2 text-sm font-medium text-stone">A0 se C1 tak chapter-based learning flow</p>
      </section>

      {!isChecking && !userId ? (
        <section className="surface-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-forest">Lesson 1 free hai. Aage ke lessons unlock karne ke liye account banao.</p>
            <Link
              href="/signup"
              aria-label="Create account to unlock more lessons"
              className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-forest/40"
            >
              Start Free
            </Link>
          </div>
        </section>
      ) : null}

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}

      {groupedLessons.map((group) => {
        if (!group.lessons.length) {
          return null;
        }

        const levelMeta = lessonLevelMeta[group.level];
        const loadingCards = Array.from({ length: group.lessons.length }, (_, index) => index);

        return (
          <section key={group.level} className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white">{group.level}</span>
              <h2 className="font-display text-2xl text-ink">{levelMeta.title}</h2>
              <p className="text-sm text-stone">{levelMeta.subtitle}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? loadingCards.map((index) => (
                    <div key={`${group.level}-loading-${index}`} className="surface-card p-6 text-sm text-stone">
                      Lessons load ho rahe hain...
                    </div>
                  ))
                : group.lessons.map((lesson) => {
                    const completedChapters = lesson.completedChapters ?? 0;
                    const totalChapters = lesson.totalChapters ?? 0;
                    const progressPercent = lesson.progressPercent ?? getLessonProgressPercent(completedChapters, totalChapters);
                    const isUnlocked = Boolean(lesson.isUnlocked);

                    return (
                      <article key={lesson.id} className="surface-card p-6 transition hover:shadow-float">
                        {isUnlocked ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <span className={getLevelBadgeClasses(lesson.cefrLevel)}>{lesson.cefrLevel}</span>
                              <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{lesson.durationMinutes} min</span>
                            </div>
                            <h3 className="mt-3 font-display text-xl text-ink">{lesson.title}</h3>
                            <p className="mt-1 text-sm text-stone">{lesson.hindiSummary}</p>
                            <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest text-stone">
                              <span>{completedChapters}/{totalChapters} chapters</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-ink/10">
                              <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(progressPercent)}`} />
                            </div>
                            <Link
                              href={buildLessonHref(lesson.id)}
                              aria-label={`${getLessonButtonLabel(lesson)} lesson ${lesson.title}`}
                              className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark"
                            >
                              {getLessonButtonLabel(lesson)}
                            </Link>
                          </>
                        ) : (
                          <>
                            <div className="pointer-events-none select-none opacity-50">
                              <div className="flex items-center justify-between gap-3">
                                <span className={getLevelBadgeClasses(lesson.cefrLevel)}>{lesson.cefrLevel}</span>
                                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{lesson.durationMinutes} min</span>
                              </div>
                              <h3 className="mt-3 font-display text-xl text-ink">{lesson.title}</h3>
                              <p className="mt-1 text-sm text-stone">{lesson.hindiSummary}</p>
                              <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest text-stone">
                                <span>{completedChapters}/{totalChapters} chapters</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="mt-3 h-2 rounded-full bg-ink/10">
                                <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(progressPercent)}`} />
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-stone">
                              <span>Locked</span>
                              <span>Pehle wala lesson complete karo</span>
                            </div>
                            <Link
                              href={buildLessonSignupHref(lesson.id)}
                              aria-label={`Create account to unlock lesson ${lesson.title}`}
                              className="mt-6 inline-flex rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:border-forest/40"
                            >
                              Login karke unlock karo
                            </Link>
                          </>
                        )}
                      </article>
                    );
                  })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
