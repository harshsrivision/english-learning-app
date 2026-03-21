"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentCefrLevel, type LearnerProgress } from "@/lib/local-progress";
import { useLearnerProgress } from "@/lib/use-learner-progress";

type Badge = {
  id: string;
  mark: string;
  name: string;
  description: string;
  hindiHint: string;
  howToEarn: string;
};

const allBadges: Badge[] = [
  {
    id: "starter-spark",
    mark: "SP",
    name: "Starter Spark",
    description: "Completed your first tracked lesson or daily milestone.",
    hindiHint: "Pehla kadam sabse mushkil hota hai.",
    howToEarn: "Complete your first lesson or first tracked study block."
  },
  {
    id: "mic-friend",
    mark: "MIC",
    name: "Mic Friend",
    description: "Logged your first meaningful speaking practice.",
    hindiHint: "Mic khul gaya to confidence build hona start ho gaya.",
    howToEarn: "Reach at least 5 minutes of total speaking practice."
  },
  {
    id: "100-words",
    mark: "100",
    name: "100 Words",
    description: "Learned your first 100 vocabulary words.",
    hindiHint: "Vocabulary hi confidence ki neev hai.",
    howToEarn: "Reach 100 vocabulary words."
  },
  {
    id: "first-conversation",
    mark: "CHAT",
    name: "First Conversation",
    description: "Completed your first AI roleplay or conversation simulation.",
    hindiHint: "Baat shuru karni aani chahiye.",
    howToEarn: "Complete any simulation scenario or roleplay."
  },
  {
    id: "3-day-streak",
    mark: "3D",
    name: "3-Day Streak",
    description: "Practiced 3 days in a row.",
    hindiHint: "Teen din ka streak adat banana start karta hai.",
    howToEarn: "Practice on 3 consecutive days."
  },
  {
    id: "week-warrior",
    mark: "7D",
    name: "Week Warrior",
    description: "Maintained a 7-day streak.",
    hindiHint: "Ek poora hafta bina ruke jana badi baat hoti hai.",
    howToEarn: "Maintain a 7-day streak."
  },
  {
    id: "grammar-star",
    mark: "GRAM",
    name: "Grammar Star",
    description: "Stayed consistent with grammar-focused practice.",
    hindiHint: "Grammar stable ho to sentence aur natural lagta hai.",
    howToEarn: "Log 5 strong grammar practice days in the weekly tracker."
  },
  {
    id: "a1-graduate",
    mark: "A1",
    name: "A1 Graduate",
    description: "Reached A1-level progress on the CEFR roadmap.",
    hindiHint: "Ab basic se practical English ki taraf move ho rahe ho.",
    howToEarn: "Earn enough XP to unlock A1."
  },
  {
    id: "speaking-milestone",
    mark: "10H",
    name: "Speaking Milestone",
    description: "Logged 10 hours of total speaking practice.",
    hindiHint: "Itna bolne ke baad awaaz me confidence aa jata hai.",
    howToEarn: "Log 600 minutes of total speaking practice."
  },
  {
    id: "monthly-master",
    mark: "30D",
    name: "Monthly Master",
    description: "Maintained a 30-day streak.",
    hindiHint: "Ek poora mahina consistency dikhana alag level hai.",
    howToEarn: "Maintain a 30-day streak."
  },
  {
    id: "vocab-sprint-winner",
    mark: "VOC",
    name: "Vocab Sprint Winner",
    description: "Won the weekly vocabulary challenge.",
    hindiHint: "Is hafte vocabulary me sabse tez growth dikh rahi hai.",
    howToEarn: "Complete the 50-word weekly vocabulary sprint."
  },
  {
    id: "c1-champion",
    mark: "C1",
    name: "C1 Champion",
    description: "Reached C1 Advanced level.",
    hindiHint: "Boardroom level fluency ab nazdeek nahi, unlock ho chuki hai.",
    howToEarn: "Reach C1 level on the CEFR roadmap."
  }
];

const badgeNameToId: Record<string, string> = {
  "Starter Spark": "starter-spark",
  "Mic Friend": "mic-friend",
  "100 Words": "100-words",
  "First Conversation": "first-conversation",
  "3-Day Streak": "3-day-streak",
  "Week Warrior": "week-warrior",
  "Grammar Star": "grammar-star",
  "A1 Graduate": "a1-graduate",
  "Speaking Milestone": "speaking-milestone",
  "Monthly Master": "monthly-master",
  "Vocab Sprint Winner": "vocab-sprint-winner",
  "C1 Champion": "c1-champion"
};

function getEarnedBadgeIds(progress: LearnerProgress) {
  const earned = new Set<string>();

  for (const badgeName of progress.badges) {
    const id = badgeNameToId[badgeName];
    if (id) {
      earned.add(id);
    }
  }

  if (progress.lessonsCompleted >= 1) earned.add("starter-spark");
  if (progress.speakingMinutes >= 5) earned.add("mic-friend");
  if (progress.vocabularyWords >= 100) earned.add("100-words");
  if (progress.weeklyStats.roleplays >= 1) earned.add("first-conversation");
  if (progress.streakDays >= 3) earned.add("3-day-streak");
  if (progress.streakDays >= 7) earned.add("week-warrior");
  if (progress.streakDays >= 30) earned.add("monthly-master");
  if (progress.weeklyStats.vocabularyWords >= 50) earned.add("vocab-sprint-winner");
  if (progress.weeklyStats.perfectGrammarDays >= 5) earned.add("grammar-star");
  if (progress.speakingMinutes >= 600) earned.add("speaking-milestone");
  if (progress.totalXp >= 180) earned.add("a1-graduate");
  if (getCurrentCefrLevel(progress.totalXp) === "C1") earned.add("c1-champion");

  return earned;
}

export default function AchievementsPage() {
  const { progress } = useLearnerProgress();

  if (!progress) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Achievements loading ho rahe hain...</div>
      </main>
    );
  }

  const earnedIds = getEarnedBadgeIds(progress);
  const earnedCount = earnedIds.size;
  const progressPercent = allBadges.length ? Math.round((earnedCount / allBadges.length) * 100) : 0;
  const currentLevel = getCurrentCefrLevel(progress.totalXp);

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Achievements"
        title="Teri Mehnat Ka Badge Board"
        subtitle="Every badge here maps to real progress you have made"
        description="Yahan tum dekh sakte ho ki kaunsi consistency, speaking, aur vocabulary milestones unlock ho chuki hain, aur next badge ke liye kya karna hai."
      />

      <section className="surface-card halo-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Unlocked badges</p>
            <h2 className="mt-3 font-display text-3xl text-ink">
              {earnedCount} / {allBadges.length}
            </h2>
            <p className="mt-2 text-sm text-stone">
              {earnedCount === allBadges.length
                ? "Sab milestones unlock ho chuke hain."
                : `${allBadges.length - earnedCount} badges abhi baki hain.`}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Total XP</p>
            <p className="mt-3 text-3xl font-bold text-ink">{progress.totalXp.toLocaleString()}</p>
            <p className="mt-2 text-sm text-stone">All tracked progress from your local learner history.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Current level</p>
            <p className="mt-3 text-3xl font-bold text-ink">{currentLevel}</p>
            <p className="mt-2 text-sm text-stone">Roadmap unlocks are driven by your saved XP.</p>
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
        {allBadges.map((badge, index) => {
          const isEarned = earnedIds.has(badge.id);

          return (
            <motion.article
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className={`surface-card p-6 transition ${isEarned ? "border-forest/20" : "opacity-70"}`}
              aria-label={`${badge.name} badge ${isEarned ? "earned" : "locked"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold tracking-[0.12em] ${
                    isEarned ? "bg-forest-soft text-forest" : "bg-mist text-stone"
                  }`}
                >
                  {isEarned ? badge.mark : "LOCK"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ink">{badge.name}</h3>
                    {isEarned ? (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">Earned</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-medium text-stone">{badge.hindiHint}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.3rem] bg-mist p-4">
                <p className="text-sm leading-6 text-stone">{badge.description}</p>
                {!isEarned ? (
                  <p className="mt-2 text-xs font-semibold text-forest">How to earn: {badge.howToEarn}</p>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </section>
    </main>
  );
}
