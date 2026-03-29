"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { learnerProgressChangedEvent, userSessionChangedEvent } from "@/lib/browser-events";
import { getCurrentCefrLevel, readLearnerProgress, type LearnerProgress } from "@/lib/local-progress";

type AchievementExtraState = {
  grammarPerfectCount: number;
  weeklyChallengeComplete: boolean;
};

type AchievementBadge = {
  id: string;
  emoji: string;
  name: string;
  howToEarn: string;
  isEarned: (progress: LearnerProgress, extraState: AchievementExtraState) => boolean;
};

const earnedDateStorageKey = "bolo-earned-badge-dates";
const lockedBadgeIcon = "\uD83D\uDD12";
const achievementBadges: AchievementBadge[] = [
  {
    id: "first-word",
    emoji: "\uD83D\uDCD6",
    name: "First Word",
    howToEarn: "Complete your first tracked lesson or study block.",
    isEarned: (progress) => progress.lessonsCompleted >= 1
  },
  {
    id: "3-day-streak",
    emoji: "\uD83D\uDD25",
    name: "3-Day Streak",
    howToEarn: "Practice for 3 days in a row.",
    isEarned: (progress) => progress.streakDays >= 3
  },
  {
    id: "week-warrior",
    emoji: "\uD83C\uDFC6",
    name: "Week Warrior",
    howToEarn: "Practice for 7 days in a row.",
    isEarned: (progress) => progress.streakDays >= 7
  },
  {
    id: "monthly-master",
    emoji: "\uD83D\uDCC5",
    name: "Monthly Master",
    howToEarn: "Practice for 30 days in a row.",
    isEarned: (progress) => progress.streakDays >= 30
  },
  {
    id: "100-words",
    emoji: "\uD83D\uDCDA",
    name: "100 Words",
    howToEarn: "Learn 100 vocabulary words.",
    isEarned: (progress) => progress.vocabularyWords >= 100
  },
  {
    id: "speaking-milestone",
    emoji: "\uD83C\uDFA4",
    name: "Speaking Milestone",
    howToEarn: "Log 600 minutes of speaking practice.",
    isEarned: (progress) => progress.speakingMinutes >= 600
  },
  {
    id: "grammar-star",
    emoji: "\u2B50",
    name: "Grammar Star",
    howToEarn: "Reach 5 perfect grammar completions.",
    isEarned: (_progress, extraState) => extraState.grammarPerfectCount >= 5
  },
  {
    id: "a1-graduate",
    emoji: "\uD83C\uDF93",
    name: "A1 Graduate",
    howToEarn: "Reach 500 total XP.",
    isEarned: (progress) => progress.totalXp >= 500
  },
  {
    id: "vocab-sprint-winner",
    emoji: "\uD83C\uDFC1",
    name: "Vocab Sprint Winner",
    howToEarn: "Complete the weekly vocabulary challenge.",
    isEarned: (progress, extraState) => extraState.weeklyChallengeComplete || progress.weeklyStats.vocabularyWords >= 50
  },
  {
    id: "c1-champion",
    emoji: "\uD83D\uDC51",
    name: "C1 Champion",
    howToEarn: "Reach 10,000 total XP.",
    isEarned: (progress) => progress.totalXp >= 10000
  }
];

function readNumberFromStorage(key: string) {
  const storedValue = window.localStorage.getItem(key);
  const parsedValue = Number(storedValue ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function readEarnedDateMap() {
  try {
    const storedValue = window.localStorage.getItem(earnedDateStorageKey);

    if (!storedValue) {
      return {} as Record<string, string>;
    }

    const parsedValue = JSON.parse(storedValue) as Record<string, string>;
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {} as Record<string, string>;
  }
}

function formatEarnedDate(value: string | undefined) {
  if (!value) {
    return "Today";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function AchievementsPage() {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [extraState, setExtraState] = useState<AchievementExtraState>({
    grammarPerfectCount: 0,
    weeklyChallengeComplete: false
  });
  const [earnedDates, setEarnedDates] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function syncAchievements() {
      const nextProgress = readLearnerProgress();
      const nextExtraState = {
        grammarPerfectCount: Math.max(readNumberFromStorage("bolo-grammar-perfect"), nextProgress.weeklyStats.perfectGrammarDays),
        weeklyChallengeComplete:
          window.localStorage.getItem("bolo-weekly-challenge-complete") === "true" || nextProgress.weeklyStats.vocabularyWords >= 50
      } satisfies AchievementExtraState;
      const nextEarnedDates = readEarnedDateMap();
      const now = new Date().toISOString();

      for (const badge of achievementBadges) {
        if (badge.isEarned(nextProgress, nextExtraState) && !nextEarnedDates[badge.id]) {
          nextEarnedDates[badge.id] = nextProgress.lastActiveDate ? new Date(nextProgress.lastActiveDate).toISOString() : now;
        }
      }

      window.localStorage.setItem(earnedDateStorageKey, JSON.stringify(nextEarnedDates));
      setProgress(nextProgress);
      setExtraState(nextExtraState);
      setEarnedDates(nextEarnedDates);
      setIsReady(true);
    }

    syncAchievements();
    window.addEventListener("storage", syncAchievements);
    window.addEventListener(learnerProgressChangedEvent, syncAchievements as EventListener);
    window.addEventListener(userSessionChangedEvent, syncAchievements as EventListener);

    return () => {
      window.removeEventListener("storage", syncAchievements);
      window.removeEventListener(learnerProgressChangedEvent, syncAchievements as EventListener);
      window.removeEventListener(userSessionChangedEvent, syncAchievements as EventListener);
    };
  }, []);

  const badgeStates = useMemo(() => {
    if (!progress) {
      return [];
    }

    return achievementBadges.map((badge) => ({
      ...badge,
      earned: badge.isEarned(progress, extraState),
      earnedDate: earnedDates[badge.id]
    }));
  }, [earnedDates, extraState, progress]);

  if (!isReady || !progress) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Achievements loading ho rahe hain...</div>
      </main>
    );
  }

  const earnedCount = badgeStates.filter((badge) => badge.earned).length;
  const progressPercent = achievementBadges.length ? Math.round((earnedCount / achievementBadges.length) * 100) : 0;
  const currentLevel = getCurrentCefrLevel(progress.totalXp);

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Achievements"
        title="Teri Mehnat Ka Badge Board"
        subtitle="Every badge here maps to real progress you have made"
        description="Yahan tum dekh sakte ho ki kaunsi streak, vocabulary, grammar, aur speaking milestones unlock ho chuki hain, aur next badge ke liye kya karna hai."
      />

      <section className="surface-card halo-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Unlocked badges</p>
            <h2 className="mt-3 font-display text-3xl text-ink">
              {earnedCount} / {achievementBadges.length}
            </h2>
            <p className="mt-2 text-sm text-stone">{achievementBadges.length - earnedCount} badges abhi baki hain.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Total XP</p>
            <p className="mt-3 text-3xl font-bold text-ink">{progress.totalXp.toLocaleString()}</p>
            <p className="mt-2 text-sm text-stone">Saved directly from your learner progress.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Current level</p>
            <p className="mt-3 text-3xl font-bold text-ink">{currentLevel}</p>
            <p className="mt-2 text-sm text-stone">XP-based roadmap unlock.</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-stone">
            <span>Badge progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-mist">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-3 rounded-full bg-forest"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {badgeStates.map((badge, index) => (
          <motion.article
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            aria-label={`${badge.name} badge ${badge.earned ? "earned" : "locked"}`}
            className={`surface-card p-6 ${badge.earned ? "border-forest/20" : "grayscale"}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${badge.earned ? "bg-forest-soft" : "bg-mist"}`}>
                {badge.earned ? badge.emoji : lockedBadgeIcon}
              </div>
              <div>
                <h3 className="font-display text-xl text-ink">{badge.name}</h3>
                <p className="mt-2 text-sm text-stone">
                  {badge.earned ? `Earned on ${formatEarnedDate(badge.earnedDate)}` : `How to earn: ${badge.howToEarn}`}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
