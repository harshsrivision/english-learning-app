"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { readLearnerProgress } from "@/lib/local-progress";

type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  hindiHint: string;
  howToEarn: string;
};

const allBadges: Badge[] = [
  {
    id: "first-word",
    emoji: "🌱",
    name: "First Word",
    description: "Completed your very first lesson",
    hindiHint: "Pehla kadam sabse mushkil hota hai",
    howToEarn: "Complete your first lesson",
  },
  {
    id: "alphabet-hero",
    emoji: "🔤",
    name: "Alphabet Hero",
    description: "Mastered the English alphabet",
    hindiHint: "A se Z tak — ab koi rok nahi",
    howToEarn: "Complete the Alphabet module",
  },
  {
    id: "100-words",
    emoji: "📖",
    name: "100 Words",
    description: "Learned your first 100 vocabulary words",
    hindiHint: "Vocabulary hi confidence ki neenv hai",
    howToEarn: "Reach 100 vocabulary words",
  },
  {
    id: "first-conversation",
    emoji: "💬",
    name: "First Conversation",
    description: "Completed your first AI roleplay simulation",
    hindiHint: "Baat shuru karni aani chahiye",
    howToEarn: "Complete any simulation scenario",
  },
  {
    id: "3-day-streak",
    emoji: "🔥",
    name: "3-Day Streak",
    description: "Practiced 3 days in a row",
    hindiHint: "Teen din ka streak — adat ban rahi hai",
    howToEarn: "Log in and practice 3 consecutive days",
  },
  {
    id: "week-warrior",
    emoji: "⚡",
    name: "Week Warrior",
    description: "Maintained a 7-day streak",
    hindiHint: "Ek poora hapta bina ruke — yahi consistency hai",
    howToEarn: "Maintain a 7-day streak",
  },
  {
    id: "grammar-star",
    emoji: "✨",
    name: "Grammar Star",
    description: "Scored 100% on 5 grammar quizzes in a row",
    hindiHint: "Grammar mein koi galti nahi — bilkul perfect",
    howToEarn: "Score 100% on 5 consecutive grammar quizzes",
  },
  {
    id: "a1-graduate",
    emoji: "🎓",
    name: "A1 Graduate",
    description: "Passed the A1 level assessment",
    hindiHint: "Pehla CEFR level clear — ab A2 ki taraf",
    howToEarn: "Pass the A1 level test",
  },
  {
    id: "speaking-milestone",
    emoji: "🎤",
    name: "Speaking Milestone",
    description: "Logged 10 hours of total speaking practice",
    hindiHint: "Dus ghante bolke — ab awaaz mein confidence aa gaya",
    howToEarn: "Log 600 minutes of speaking practice",
  },
  {
    id: "monthly-master",
    emoji: "🏆",
    name: "Monthly Master",
    description: "Maintained a 30-day streak",
    hindiHint: "Ek poora mahina — ab English teri aadat ban gayi",
    howToEarn: "Maintain a 30-day streak",
  },
  {
    id: "vocab-sprint-winner",
    emoji: "🏅",
    name: "Vocab Sprint Winner",
    description: "Won the weekly vocabulary challenge",
    hindiHint: "Is hafte vocabulary mein sabse aage — champion",
    howToEarn: "Complete the Vocabulary Sprint weekly challenge",
  },
  {
    id: "c1-champion",
    emoji: "👑",
    name: "C1 Champion",
    description: "Reached C1 Advanced level",
    hindiHint: "Boardroom tak — ab koi rok nahi sakta",
    howToEarn: "Reach C1 level on the CEFR roadmap",
  },
];

// Map badge names to IDs for matching with stored progress
const badgeNameToId: Record<string, string> = {
  "Starter Spark": "first-word",
  "Mic Friend": "first-conversation",
  "First Word": "first-word",
  "Alphabet Hero": "alphabet-hero",
  "100 Words": "100-words",
  "First Conversation": "first-conversation",
  "3-Day Streak": "3-day-streak",
  "Week Warrior": "week-warrior",
  "Grammar Star": "grammar-star",
  "A1 Graduate": "a1-graduate",
  "Speaking Milestone": "speaking-milestone",
  "Monthly Master": "monthly-master",
  "Vocab Sprint Winner": "vocab-sprint-winner",
  "C1 Champion": "c1-champion",
};

export default function AchievementsPage() {
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const progress = readLearnerProgress();
    setTotalXp(progress.totalXp);
    const earned = new Set<string>();

    // Map stored badge names to IDs
    for (const badge of progress.badges) {
      const id = badgeNameToId[badge];
      if (id) earned.add(id);
    }

    // Auto-unlock based on progress stats
    if (progress.lessonsCompleted >= 1) earned.add("first-word");
    if (progress.vocabularyWords >= 100) earned.add("100-words");
    if (progress.streakDays >= 3) earned.add("3-day-streak");
    if (progress.streakDays >= 7) earned.add("week-warrior");
    if (progress.streakDays >= 30) earned.add("monthly-master");
    if (progress.speakingMinutes >= 600) earned.add("speaking-milestone");

    setEarnedIds(earned);
  }, []);

  const earnedCount = earnedIds.size;

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Achievements"
        title="Teri Mehnat Ka Badge"
        subtitle="Every badge is a milestone you actually earned"
        description="Yahan woh sab dikhta hai jo tune consistently karke unlock kiya. Locked badges teri agle steps hain — ek ek karke unlock hoti jayengi."
      />

      {/* Stats bar */}
      <section className="surface-card halo-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-ink">
              {earnedCount} / {allBadges.length} Badges Unlocked
            </h2>
            <p className="mt-2 text-sm font-medium text-stone">
              {allBadges.length - earnedCount === 0
                ? "Sab badges mil gaye — tu legend hai! 👑"
                : `${allBadges.length - earnedCount} badges abhi baki hain — keep going!`}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-[1.5rem] bg-forest px-5 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Total XP</p>
              <p className="mt-1 text-2xl font-bold">{totalXp.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-stone mb-2">
            <span>Progress</span>
            <span>{Math.round((earnedCount / allBadges.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-mist">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / allBadges.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-3 rounded-full bg-forest"
            />
          </div>
        </div>
      </section>

      {/* Badge grid */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {allBadges.map((badge, index) => {
          const isEarned = earnedIds.has(badge.id);

          return (
            <motion.article
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className={`surface-card p-6 transition ${
                isEarned ? "border-forest/20" : "opacity-60"
              }`}
              aria-label={`${badge.name} badge — ${isEarned ? "earned" : "locked"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    isEarned ? "bg-forest-soft" : "bg-mist"
                  }`}
                >
                  {isEarned ? badge.emoji : "🔒"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ink">{badge.name}</h3>
                    {isEarned && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-stone">{badge.hindiHint}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.3rem] bg-mist p-4">
                <p className="text-sm leading-6 text-stone">{badge.description}</p>
                {!isEarned && (
                  <p className="mt-2 text-xs font-semibold text-forest">
                    How to earn: {badge.howToEarn}
                  </p>
                )}
              </div>
            </motion.article>
          );
        })}
      </section>
    </main>
  );
}
