"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetchJson } from "@/lib/api";
import { readGuestCompletedChapterIds } from "@/lib/guest-learning-progress";
import {
  genericLearningErrorMessage,
  getLevelBadgeClasses,
  getNextIncompleteChapter,
  getProgressWidthClass,
  getTypeBadgeClasses,
  lockedLessonSignupMessage,
  type LessonDetail,
  type LessonSummary
} from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

function buildChapterHref(lessonId: number, chapterId: string) {
  return `/lessons/${lessonId}/${chapterId}` as Route;
}

function buildSignupHref(lessonId: number) {
  return `/signup?next=${encodeURIComponent(`/lessons/${lessonId}`)}&message=${encodeURIComponent(lockedLessonSignupMessage)}` as Route;
}

function getGuestCompletedChapterIdsForLesson(lessonId: number, chapterIds: string[]) {
  const prefix = `l${String(lessonId).padStart(2, "0")}-`;
  return new Set(chapterIds.filter((chapterId) => chapterId.startsWith(prefix)));
}

type LessonDetailProps = {
  lessonId: number;
};

export function LessonDetailView({ lessonId }: LessonDetailProps) {
  const router = useRouter();
  const { userId, isChecking } = useUserSession();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [lessonSummary, setLessonSummary] = useState<LessonSummary | null>(null);
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
    if (!isChecking && !userId && lessonId > 1) {
      router.replace(buildSignupHref(lessonId));
    }
  }, [isChecking, lessonId, router, userId]);

  useEffect(() => {
    let ignore = false;

    async function loadLesson() {
      try {
        setIsLoading(true);
        setError(null);

        const lessonEndpoint = userId ? `lessons/${lessonId}?userId=${userId}` : `lessons/${lessonId}`;
        const summaryEndpoint = userId ? `lessons?userId=${userId}` : "lessons";
        const [detailData, summaryData] = await Promise.all([
          apiFetchJson<LessonDetail>(lessonEndpoint, { timeoutMs: 20000 }),
          apiFetchJson<LessonSummary[]>(summaryEndpoint, { timeoutMs: 20000 })
        ]);

        if (!ignore) {
          setLesson(detailData);
          setLessonSummary(summaryData.find((item) => item.id === lessonId) ?? null);
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

    void loadLesson();

    return () => {
      ignore = true;
    };
  }, [lessonId, userId]);

  const displayLesson = useMemo(() => {
    if (!lesson) {
      return null;
    }

    if (userId) {
      return {
        ...lesson,
        isUnlocked: lessonSummary?.isUnlocked ?? true,
        chapters: lesson.chapters
      };
    }

    const guestCompletedSet = getGuestCompletedChapterIdsForLesson(lesson.id, guestCompletedChapterIds);
    return {
      ...lesson,
      isUnlocked: lesson.id === 1,
      completedChapters: guestCompletedSet.size,
      chapters: lesson.chapters.map((chapter) => ({
        ...chapter,
        isCompleted: guestCompletedSet.has(chapter.id)
      }))
    };
  }, [guestCompletedChapterIds, lesson, lessonSummary?.isUnlocked, userId]);

  const continueChapter = displayLesson ? getNextIncompleteChapter(displayLesson.chapters) : null;
  const progressPercent = displayLesson?.totalChapters
    ? Math.round(((displayLesson.completedChapters ?? 0) / displayLesson.totalChapters) * 100)
    : 0;

  if (!isChecking && !userId && lessonId > 1) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Signup page khol rahe hain...</div>
      </main>
    );
  }

  return (
    <main className="section-shell space-y-8">
      <nav className="flex items-center gap-2 text-xs text-stone">
        <Link href="/lessons" aria-label="Open lessons page" className="hover:text-ink">
          Lessons
        </Link>
        <span>{">"}</span>
        <span className="font-semibold text-ink">{displayLesson?.title ?? "Lesson"}</span>
      </nav>

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Lesson loading ho raha hai...</div> : null}

      {displayLesson ? (
        <>
          {!displayLesson.isUnlocked ? (
            <section className="surface-card p-6 sm:p-8">
              <p className="text-sm font-semibold text-forest">Yeh lesson abhi locked hai.</p>
              <p className="mt-2 text-sm text-stone">Pehle previous lesson complete karo ya lessons page se progress continue karo.</p>
              <Link
                href="/lessons"
                aria-label="Go back to lessons list"
                className="mt-5 inline-flex rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:border-forest/40"
              >
                Back to Lessons
              </Link>
            </section>
          ) : (
            <>
              <section className="surface-card halo-panel p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getLevelBadgeClasses(displayLesson.cefrLevel)}>{displayLesson.cefrLevel}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{displayLesson.durationMinutes} min</span>
                </div>
                <h1 className="mt-4 font-display text-4xl text-ink">{displayLesson.title}</h1>
                <p className="mt-2 text-base font-medium text-stone">{displayLesson.hindiSummary}</p>
                <div className="mt-6 flex items-center justify-between gap-3 text-sm font-semibold text-stone">
                  <span>
                    {displayLesson.completedChapters} of {displayLesson.totalChapters} chapters complete
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-ink/10">
                  <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(progressPercent)}`} />
                </div>
                {continueChapter ? (
                  <Link
                    href={buildChapterHref(displayLesson.id, continueChapter.id)}
                    aria-label={`Continue learning with chapter ${continueChapter.title}`}
                    className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark"
                  >
                    Continue Learning
                  </Link>
                ) : null}
              </section>

              <section className="space-y-3">
                {displayLesson.chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={buildChapterHref(displayLesson.id, chapter.id)}
                    aria-label={`Open chapter ${chapter.title}`}
                    className="surface-card flex items-center justify-between gap-4 p-5 transition hover:border-forest/20 hover:shadow-float"
                  >
                    <div>
                      <span className={getTypeBadgeClasses(chapter.type)}>{chapter.type}</span>
                      <h2 className="mt-3 font-display text-2xl text-ink">{chapter.title}</h2>
                      <p className="mt-1 text-base font-medium text-forest">{chapter.hindiTitle}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-stone">
                      {chapter.isCompleted ? <span className="text-forest">Complete</span> : <span>Start {"->"}</span>}
                    </div>
                  </Link>
                ))}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
