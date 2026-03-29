"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { buildSignupHref } from "@/lib/auth-navigation";
import type { CurriculumLevelSummary } from "@/lib/curriculum";
import {
  buildCurriculumLevelRoute,
  getCurriculumBandBadgeClasses,
  getCurriculumCompletedSet,
  getCurriculumLevelDurationLabel,
  getCurriculumLevelProgress,
  getCurriculumUnlockedLevelIds,
  readCurriculumProgress,
  type CurriculumProgress
} from "@/lib/curriculum-lessons";
import { getProgressWidthClass } from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

function getLessonsApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
}

export function LessonsHub() {
  const { userId, hasSession, isChecking } = useUserSession();
  const signupHref = buildSignupHref("/lessons");
  const [levels, setLevels] = useState<CurriculumLevelSummary[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress>({ completedChapterIds: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProgress(readCurriculumProgress(userId));
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadLevels() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${getLessonsApiBaseUrl()}/api/curriculum/levels`);

        if (!response.ok) {
          throw new Error("Failed to load levels");
        }

        const data = (await response.json().catch(() => [])) as CurriculumLevelSummary[];

        if (!ignore) {
          setLevels(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          setError("Lessons load nahi ho paaye — dobara try karo");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadLevels();

    return () => {
      ignore = true;
    };
  }, []);

  const completedSet = useMemo(() => getCurriculumCompletedSet(progress), [progress]);
  const unlockedLevelIds = useMemo(() => getCurriculumUnlockedLevelIds(levels, completedSet, hasSession), [completedSet, hasSession, levels]);
  const groupedLevels = useMemo(() => {
    return [...levels]
      .sort((left, right) => left.level - right.level)
      .reduce<Array<{ cefrBand: string; levels: CurriculumLevelSummary[] }>>((groups, level) => {
        const lastGroup = groups[groups.length - 1];

        if (lastGroup && lastGroup.cefrBand === level.cefr_band) {
          lastGroup.levels.push(level);
          return groups;
        }

        groups.push({
          cefrBand: level.cefr_band,
          levels: [level]
        });

        return groups;
      }, []);
  }, [levels]);

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Structured Lessons"
        title="English Lessons, Clear Progress"
        subtitle="A0 se B2 tak level-by-level path"
        description="Backend curriculum ke saath ab har level, chapter, aur progress state ek hi flow mein milega. Guest learners level 1 free explore kar sakte hain, aur login ke baad poora path unlock hota chala jayega."
      />

      {!isChecking && !hasSession ? (
        <section className="surface-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-forest">Level 1 free hai. Baaki levels unlock karne ke liye account banao.</p>
              <p className="mt-1 text-sm text-stone">Guest mode mein tum shuru kar sakte ho, login ke baad full curriculum continue kar paoge.</p>
            </div>
            <Link
              href={signupHref}
              aria-label="Create account to unlock the full lesson curriculum"
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
            >
              Start Free
            </Link>
          </div>
        </section>
      ) : null}

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Levels load ho rahe hain...</div> : null}

      {!isLoading ? (
        <div className="space-y-8">
          {groupedLevels.map((group) => (
            <section key={group.cefrBand} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getCurriculumBandBadgeClasses(group.cefrBand)}>{group.cefrBand}</span>
                  <p className="text-sm font-semibold text-stone">{group.levels.length} structured paths</p>
                </div>
                <p className="text-sm text-stone">Hindi support ke saath guided lessons</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {group.levels.map((level) => {
                  const levelProgress = getCurriculumLevelProgress(level, completedSet);
                  const isUnlocked = unlockedLevelIds.has(level.level);
                  const isGuestLocked = !hasSession && level.level > 1;
                  const href = buildCurriculumLevelRoute(level.level) as Route;
                  const callToActionLabel = levelProgress.completedCount === 0 ? "Start" : "Continue";

                  return (
                    <article
                      key={level.level}
                      className={`surface-card flex h-full flex-col gap-5 p-6 transition hover:shadow-float ${!isUnlocked ? "opacity-50" : ""}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={getCurriculumBandBadgeClasses(level.cefr_band)}>{level.cefr_band}</span>
                          <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-stone">Level {level.level}</span>
                          {!hasSession && level.level === 1 ? (
                            <span className="rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest">Guest free</span>
                          ) : null}
                        </div>
                        <span className="text-sm font-semibold text-stone">{getCurriculumLevelDurationLabel(level.lesson_count)}</span>
                      </div>

                      <div>
                        <h2 className="font-display text-3xl text-ink">{level.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone">{level.outcome}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.5rem] bg-mist p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone">Chapters</p>
                          <p className="mt-2 text-2xl font-bold text-ink">{level.chapter_count}</p>
                        </div>
                        <div className="rounded-[1.5rem] bg-mist p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone">Lessons</p>
                          <p className="mt-2 text-2xl font-bold text-ink">{level.lesson_count}</p>
                        </div>
                        <div className="rounded-[1.5rem] bg-mist p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone">Progress</p>
                          <p className="mt-2 text-2xl font-bold text-ink">{levelProgress.progressPercent}%</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
                          <span>{levelProgress.completedCount}/{levelProgress.totalChapters} chapters done</span>
                          <span>{levelProgress.progressPercent}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-ink/10">
                          <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(levelProgress.progressPercent)}`} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {level.chapters.slice(0, 3).map((chapter) => (
                          <span key={chapter.chapter_id} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs text-stone">
                            {chapter.title}
                          </span>
                        ))}
                      </div>

                      {isUnlocked ? (
                        <Link
                          href={href}
                          aria-label={`${callToActionLabel} level ${level.level} lessons`}
                          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                        >
                          {callToActionLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : isGuestLocked ? (
                        <>
                          <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-stone">
                            <LockKeyhole className="h-4 w-4" />
                            Login karke unlock karo
                          </div>
                          <Link
                            href={signupHref}
                            aria-label={`Create account to unlock level ${level.level}`}
                            className="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest/40"
                          >
                            Login karke unlock karo
                          </Link>
                        </>
                      ) : (
                        <div className="mt-auto space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-stone">
                            <LockKeyhole className="h-4 w-4" />
                            Pehle wala lesson complete karo
                          </div>
                          <button
                            type="button"
                            aria-label={`Level ${level.level} is locked until the previous lesson is complete`}
                            disabled
                            className="inline-flex items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-stone"
                          >
                            Locked
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </main>
  );
}
