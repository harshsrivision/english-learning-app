"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetchJson } from "@/lib/api";
import { readGuestCompletedChapterIds, writeGuestCompletedChapterIds } from "@/lib/guest-learning-progress";
import { recordLearnerProgress } from "@/lib/local-progress";
import {
  genericLearningErrorMessage,
  getLevelBadgeClasses,
  getProgressWidthClass,
  getTypeBadgeClasses,
  lockedLessonSignupMessage,
  type LessonDetail
} from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

function buildLessonHref(lessonId: number) {
  return `/lessons/${lessonId}` as Route;
}

function buildChapterHref(lessonId: number, chapterId: string) {
  return `/lessons/${lessonId}/${chapterId}` as Route;
}

function buildSignupHref(lessonId: number, chapterId: string) {
  return `/signup?next=${encodeURIComponent(`/lessons/${lessonId}/${chapterId}`)}&message=${encodeURIComponent(lockedLessonSignupMessage)}` as Route;
}

function getGuestCompletedSet(lessonId: number, chapterIds: string[]) {
  const prefix = `l${String(lessonId).padStart(2, "0")}-`;
  return new Set(chapterIds.filter((chapterId) => chapterId.startsWith(prefix)));
}

type ChapterDetailProps = {
  lessonId: number;
  chapterId: string;
};

export function ChapterDetailView({ lessonId, chapterId }: ChapterDetailProps) {
  const router = useRouter();
  const { userId, isChecking } = useUserSession();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [guestCompletedChapterIds, setGuestCompletedChapterIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const [showXpToast, setShowXpToast] = useState(false);
  const [showNextAction, setShowNextAction] = useState(false);
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
      router.replace(buildSignupHref(lessonId, chapterId));
    }
  }, [chapterId, isChecking, lessonId, router, userId]);

  useEffect(() => {
    let ignore = false;

    async function loadLesson() {
      try {
        setIsLoading(true);
        setError(null);

        const detailEndpoint = userId ? `lessons/${lessonId}?userId=${userId}` : `lessons/${lessonId}`;
        const summaryEndpoint = userId ? `lessons?userId=${userId}` : "lessons";
        const [detailData, summaryData] = await Promise.all([
          apiFetchJson<LessonDetail>(detailEndpoint, { timeoutMs: 20000 }),
          apiFetchJson<Array<{ id: number; isUnlocked?: boolean }>>(summaryEndpoint, { timeoutMs: 20000 })
        ]);

        if (!ignore) {
          setLesson(detailData);
          setIsUnlocked(summaryData.find((item) => item.id === lessonId)?.isUnlocked ?? lessonId === 1);
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
  }, [chapterId, lessonId, userId]);

  const displayLesson = useMemo(() => {
    if (!lesson) {
      return null;
    }

    if (userId) {
      return lesson;
    }

    const completedSet = getGuestCompletedSet(lesson.id, guestCompletedChapterIds);
    return {
      ...lesson,
      completedChapters: completedSet.size,
      chapters: lesson.chapters.map((chapter) => ({
        ...chapter,
        isCompleted: completedSet.has(chapter.id)
      }))
    };
  }, [guestCompletedChapterIds, lesson, userId]);

  const chapterIndex = displayLesson?.chapters.findIndex((chapter) => chapter.id === chapterId) ?? -1;
  const chapter = chapterIndex >= 0 && displayLesson ? displayLesson.chapters[chapterIndex] : null;
  const nextChapter = displayLesson && chapterIndex >= 0 ? displayLesson.chapters[chapterIndex + 1] ?? null : null;
  const progressPercent = displayLesson?.totalChapters
    ? Math.round(((displayLesson.completedChapters ?? 0) / displayLesson.totalChapters) * 100)
    : 0;

  useEffect(() => {
    if (!showXpToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowXpToast(false);
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showXpToast]);

  function getOptionClasses(option: string) {
    if (!chapter || !selectedOption) {
      return "rounded-[1.5rem] border border-ink/10 bg-mist px-5 py-4 text-left text-sm font-medium text-ink transition hover:border-forest/30 hover:bg-white";
    }

    if (option === chapter.content.exercise.answer) {
      return "rounded-[1.5rem] border border-green-600 bg-green-50 px-5 py-4 text-left text-sm font-medium text-green-800";
    }

    if (option === selectedOption) {
      return "rounded-[1.5rem] border border-red-400 bg-red-50 px-5 py-4 text-left text-sm font-medium text-red-700";
    }

    return "rounded-[1.5rem] border border-ink/10 bg-mist px-5 py-4 text-left text-sm font-medium text-ink";
  }

  async function completeChapter() {
    if (!chapter || !displayLesson || !selectedOption || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (userId) {
        await apiFetchJson<{ success: boolean }>("chapterProgress", {
          method: "POST",
          timeoutMs: 20000,
          body: JSON.stringify({
            userId,
            lessonId,
            chapterId,
            score: selectedOption === chapter.content.exercise.answer ? 100 : 60
          })
        });
      } else {
        const nextChapterIds = Array.from(new Set([...guestCompletedChapterIds, chapterId]));
        writeGuestCompletedChapterIds(nextChapterIds);
        setGuestCompletedChapterIds(nextChapterIds);
      }

      recordLearnerProgress({ xp: 50, streakActivity: true });
      setLesson((currentLesson) => {
        if (!currentLesson) {
          return currentLesson;
        }

        const alreadyCompleted = currentLesson.chapters.some((item) => item.id === chapterId && item.isCompleted);
        return {
          ...currentLesson,
          completedChapters: alreadyCompleted ? currentLesson.completedChapters : currentLesson.completedChapters + 1,
          chapters: currentLesson.chapters.map((item) =>
            item.id === chapterId
              ? {
                  ...item,
                  isCompleted: true
                }
              : item
          )
        };
      });
      setShowXpToast(true);
      setShowNextAction(true);
    } catch {
      setError(genericLearningErrorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isChecking && !userId && lessonId > 1) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Signup page khol rahe hain...</div>
      </main>
    );
  }

  return (
    <main className="section-shell space-y-5">
      {showXpToast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white shadow-float animate-bounce">+50 XP earned!</div> : null}

      {displayLesson ? (
        <nav className="mb-8 flex items-center gap-2 text-xs text-stone">
          <Link href="/lessons" aria-label="Open lessons page" className="hover:text-ink">
            Lessons
          </Link>
          <span>{">"}</span>
          <Link href={buildLessonHref(displayLesson.id)} aria-label={`Open lesson ${displayLesson.title}`} className="hover:text-ink">
            {displayLesson.title}
          </Link>
          <span>{">"}</span>
          <span className="font-semibold text-ink">{chapter?.title ?? "Chapter"}</span>
        </nav>
      ) : null}

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Chapter loading ho raha hai...</div> : null}

      {displayLesson && chapter ? (
        <>
          {!isUnlocked ? (
            <section className="surface-card p-6 sm:p-8">
              <p className="text-sm font-semibold text-forest">Yeh chapter abhi locked lesson ke andar hai.</p>
              <Link href={buildLessonHref(displayLesson.id)} aria-label="Go back to lesson page" className="mt-5 inline-flex rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:border-forest/40">
                Back to Lesson
              </Link>
            </section>
          ) : (
            <>
              <section className="surface-card halo-panel p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getLevelBadgeClasses(displayLesson.cefrLevel)}>{displayLesson.cefrLevel}</span>
                  <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">{displayLesson.durationMinutes} min lesson</span>
                </div>
                <div className="mt-6 h-2 rounded-full bg-ink/10">
                  <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(progressPercent)}`} />
                </div>
                <p className="mt-3 text-sm font-medium text-stone">
                  {displayLesson.completedChapters} of {displayLesson.totalChapters} chapters complete
                </p>
              </section>

              <section className="mb-8">
                <span className={getTypeBadgeClasses(chapter.type)}>{chapter.type}</span>
                <h1 className="mt-3 font-display text-4xl text-ink">{chapter.title}</h1>
                <p className="mt-1 text-base font-medium text-forest">{chapter.hindiTitle}</p>
              </section>

              <section className="surface-card mb-5 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Explanation</p>
                <p className="mt-4 text-sm leading-7 text-stone">{chapter.content.explanation}</p>
                <div className="mt-4 rounded-[1.5rem] bg-forest-soft p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-forest">Hindi mein samjho</p>
                  <p className="text-sm leading-7 text-stone">{chapter.content.hindiExplanation}</p>
                </div>
              </section>

              <section className="surface-card mb-5 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Examples</p>
                <div className="mt-5 space-y-3">
                  {chapter.content.examples.map((example, index) => (
                    <div key={`${chapter.id}-example-${index}`} className="rounded-r-2xl border-l-4 border-forest bg-mist px-5 py-4">
                      <p className="text-sm font-semibold text-ink">{example}</p>
                      <p className="mt-1 text-xs text-stone">{chapter.content.hindiTranslations[index]}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card mb-5 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Practice</p>
                <h2 className="mt-4 font-display text-2xl text-ink">{chapter.content.exercise.question}</h2>
                <p className="mt-1 mb-6 text-sm italic text-stone">{chapter.content.exercise.hindiHint}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {chapter.content.exercise.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-label={`Choose option ${option}`}
                      onClick={() => {
                        setSelectedOption(option);
                        const isCorrect = option === chapter.content.exercise.answer;
                        setFeedbackTone(isCorrect ? "success" : "error");
                        setFeedbackMessage(isCorrect ? "Sahi jawab. Ab chapter complete karke aage badho." : "Answer close hai, hint dobara dekho aur phir bhi chapter complete kar sakte ho.");
                      }}
                      className={getOptionClasses(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {feedbackMessage ? (
                  <p className={`mt-5 rounded-[1.25rem] px-4 py-3 text-sm ${feedbackTone === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                    {feedbackMessage}
                  </p>
                ) : null}
              </section>

              <section className="surface-card p-6 sm:p-8">
                <button
                  type="button"
                  aria-label="Complete current chapter"
                  disabled={!selectedOption || isSaving || chapter.isCompleted}
                  onClick={() => void completeChapter()}
                  className="w-full rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {chapter.isCompleted ? "Chapter Complete" : isSaving ? "Saving..." : "Complete Chapter"}
                </button>
                {showNextAction || chapter.isCompleted ? (
                  <Link
                    href={nextChapter ? buildChapterHref(displayLesson.id, nextChapter.id) : buildLessonHref(displayLesson.id)}
                    aria-label={nextChapter ? `Open next chapter ${nextChapter.title}` : `Go back to lesson ${displayLesson.title}`}
                    className="mt-4 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark"
                  >
                    {nextChapter ? "Next Chapter ->" : "Back to Lesson ->"}
                  </Link>
                ) : null}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
