"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/section-title";
import { getApiUrl } from "@/lib/api";
import { useRequiredUserId } from "@/lib/use-required-user-id";
import { learnerSnapshot, lessons, recentActivities, skillProgress, weeklyGoals } from "@/lib/mock-data";

type DailyProgress = {
  sentences_spoken?: number;
  words_learned?: number;
  lessons_completed?: number;
  current_streak?: number;
  total_lessons_completed?: number;
  total_vocabulary_learned?: number;
  error?: string;
};

export default function DashboardPage() {
  const { userId, isChecking } = useRequiredUserId();
  const [progress, setProgress] = useState<DailyProgress>({});
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let ignore = false;

    async function loadProgress() {
      try {
        setProgressError(null);

        const dailyProgressApiUrl = getApiUrl("dailyProgress");
        const response = await fetch(`${dailyProgressApiUrl}/${userId}`);
        const data = (await response.json()) as DailyProgress;

        if (!response.ok) {
          throw new Error(data.error ?? "Daily progress could not be loaded.");
        }

        if (!ignore) {
          setProgress(data);
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Daily progress could not be loaded.";

        if (!ignore) {
          setProgressError(message);
        }
      }
    }

    void loadProgress();

    return () => {
      ignore = true;
    };
  }, [userId]);

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2.5rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Learner Dashboard</p>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Track progress from daily practice to professional fluency.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
            {learnerSnapshot.name} is currently at the <span className="font-semibold text-teal">{learnerSnapshot.currentLevel}</span>{" "}
            level and is {learnerSnapshot.progressToNextLevel}% of the way to <span className="font-semibold text-clay">{learnerSnapshot.nextLevel}</span>.
          </p>

          <div className="mt-8 rounded-[2rem] bg-sand p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink">Progress to next level</p>
              <p className="text-sm font-semibold text-clay">{learnerSnapshot.progressToNextLevel}%</p>
            </div>
            <div className="mt-4 h-3 rounded-full bg-white">
              <div className="h-3 rounded-full bg-clay" style={{ width: `${learnerSnapshot.progressToNextLevel}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-ink/10 bg-ink p-6 text-white shadow-card">
            <p className="text-sm text-white/65">Sentences today</p>
            <p className="mt-3 text-4xl font-semibold">{progress.sentences_spoken ?? 0}</p>
            <p className="mt-3 text-sm text-white/75">Every analyzed speaking attempt is counted here.</p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
            <p className="text-sm text-ink/60">Words learned today</p>
            <p className="mt-3 text-4xl font-semibold text-teal">{progress.words_learned ?? 0}</p>
            <p className="mt-3 text-sm text-ink/70">Vocabulary practice updates the daily word count.</p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
            <p className="text-sm text-ink/60">Lessons completed today</p>
            <p className="mt-3 text-4xl font-semibold text-clay">{progress.lessons_completed ?? 0}</p>
            <p className="mt-3 text-sm text-ink/70">Interactive lesson completions save directly to the backend.</p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
            <p className="text-sm text-ink/60">Current streak</p>
            <p className="mt-3 text-4xl font-semibold text-gold">{progress.current_streak ?? 0} days</p>
            <p className="mt-3 text-sm text-ink/70">The streak updates from saved daily activity, not from mock data.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Live Account Summary</p>
        <h2 className="mt-4 font-display text-3xl text-ink">Daily progress and totals from the backend</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
          {`This panel reads today's saved progress and user totals for learner ${userId}.`}
        </p>

        {progressError ? <p className="mt-6 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{progressError}</p> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Sentences Spoken Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.sentences_spoken ?? 0}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Words Learned Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.words_learned ?? 0}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Lessons Completed Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.lessons_completed ?? 0}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Current Streak</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.current_streak ?? 0}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Total Lessons Completed</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.total_lessons_completed ?? 0}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Total Vocabulary Learned</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{progress.total_vocabulary_learned ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Skill Breakdown"
          title="See where progress is accelerating and where more repetition is needed"
          description="These progress bars can be connected to backend scoring later, but they already establish the dashboard structure and level overview."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {skillProgress.map((item) => (
            <div key={item.skill} className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl text-ink">{item.skill}</h2>
                <span className="text-sm font-semibold text-teal">{item.percent}%</span>
              </div>
              <div className="mt-4 h-3 rounded-full bg-sand">
                <div className="h-3 rounded-full bg-teal" style={{ width: `${item.percent}%` }} />
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/70">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Weekly Goals</p>
          <div className="mt-6 space-y-5">
            {weeklyGoals.map((goal) => (
              <div key={goal.title}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{goal.title}</p>
                    <p className="text-sm text-ink/65">{goal.target}</p>
                  </div>
                  <span className="text-sm font-semibold text-clay">{goal.progress}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-sand">
                  <div className="h-3 rounded-full bg-clay" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-ink p-8 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Recent Activity</p>
          <div className="mt-6 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-2xl">{activity.title}</h2>
                  <span className="text-sm text-white/60">{activity.timeLabel}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/80">{activity.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Level Roadmap</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-3xl bg-sand p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{lesson.level}</p>
              <h2 className="mt-3 font-display text-2xl text-ink">{lesson.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">{lesson.focus}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-ink/65">
          Completed lessons: {progress.total_lessons_completed ?? 0} | Vocabulary mastered: {progress.total_vocabulary_learned ?? 0}
        </p>
      </section>
    </main>
  );
}
